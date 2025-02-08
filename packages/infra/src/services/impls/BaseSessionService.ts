import { ADataStoreFactory, ConversationMessage, IStoreContext, Pitch, Screening } from "@sebu/db-models";
import { ABaseSessionService } from "../interfaces/ABaseSessionService";
import { AgentLambdaRequest, AgentLambdaRequestDTOSchema } from "@sebu/dto";
import { ASQSService } from "@sebu/sqs-service";
import { ConfigService } from "@nestjs/config";

export abstract class BaseSessionService<T extends Pitch | Screening> extends ABaseSessionService<T> {

    sendQName: string;
    constructor(
        readonly ds: ADataStoreFactory,
        readonly sqs: ASQSService,
        readonly config: ConfigService,
        readonly sessionContext: 'screen' | 'pitch'
    ) {
        super();
        this.sendQName = this.config.getOrThrow("aws.sqs.queues.agentRunnerQueue");
    }

    abstract getSession(id: number, ctx: IStoreContext): Promise<T>;
    abstract saveSession(session: T, ctx: IStoreContext): Promise<T>;

    async sendUserMessage(sessionId: number, message: string, lastId?: number): Promise<ConversationMessage[]> {
        
        if(message.trim().length === 0) {   
            throw new Error("Empty message content not allowed");
        }

        let outgoing: ConversationMessage;
        let agentPlaceholder: ConversationMessage;
        const retVals = await this.ds.readWriteContext(async (ctx) => {
            const session = await this.getSession(sessionId, ctx);
            if(!session) {
                throw new Error("Session not found");   
            }
            const msg = new ConversationMessage();
            msg.content = message;
            if(!session.conversation.messages.isInitialized(true)) {
                await session.conversation.messages.init();
            }
            msg.conversation = session.conversation;
            msg.role = "user";
            msg.sender = "user";
            session.conversation.messages.add(msg);

            const agentMsgPlaceholder = new ConversationMessage();
            agentMsgPlaceholder.role = "assistant";
            agentMsgPlaceholder.sender = "assistant";
            agentMsgPlaceholder.content = "";
            agentMsgPlaceholder.conversation = session.conversation;
            session.conversation.messages.add(agentMsgPlaceholder);
            await this.saveSession(session, ctx);
            outgoing = msg;
            agentPlaceholder = agentMsgPlaceholder;
            if(lastId) {
                return session.conversation.messages.toArray().filter(m => m.id > lastId);
            }
            return [msg];
        });
        const dto: AgentLambdaRequest = AgentLambdaRequestDTOSchema.parse({
            sessionId: sessionId,
            userMsgId: outgoing.id,
            responseMsgId: agentPlaceholder.id,
            context: this.sessionContext
        });
        await this.sqs.send(this.sendQName, dto);
        return retVals;
    }

    async getMessage(id: number): Promise<ConversationMessage> {
        return this.ds.readOnlyContext(async (ctx) => {
            const session = await this.getSession(id, ctx);
            if(!session.conversation.messages.isInitialized(true)) {
                await session.conversation.messages.init();
            }
            return session.conversation.messages.toArray().filter(m => m.id === id)[0];
        });
    }

    async getMessages(sessionId: number, lastId?: number): Promise<ConversationMessage[]> {
        return this.ds.readOnlyContext(async (ctx) => {
            const screening = await this.getSession(sessionId, ctx);
            if(!screening.conversation.messages.isInitialized(true)) {
                await screening.conversation.messages.init();
            }
            const msgs = screening.conversation.messages.toArray();
            if(lastId) {
                return msgs.filter(m => m.id > lastId);
            }
            return msgs;
        });
    }
}