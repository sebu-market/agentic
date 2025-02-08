import { Injectable, Logger } from "@nestjs/common";
import { AMessageBus, IInboundMessageEnvelope, IOutboundMessageEnvelope, IOutboundMessageHandler } from "@sebu/communication";
import { ADataStoreFactory, APitchStore, AScreeningStore } from "@sebu/db-models";
import { AgentLambdaRequestDTO } from "@sebu/dto";


@Injectable()
export class AgentForwardingService implements IOutboundMessageHandler {
    readonly log: Logger

    constructor(
        readonly msgBus: AMessageBus,
        readonly ds: ADataStoreFactory,
    ) {
        this.log = new Logger(this.constructor.name);
    }

    async callAgent(dto: AgentLambdaRequestDTO): Promise<void> {
        this.log.log('callAgent', dto);

        await this.ds.readOnlyContext(async (ctx) => {
            const store = ctx.getDataStore(dto.context === 'pitch' ? APitchStore : AScreeningStore);
            const sess = await store.findById(dto.sessionId, true);
            if (!sess) {
                throw new Error(`Session ${dto.sessionId} not found`);
            }
            if (!sess.conversation.messages.isInitialized(true)) {
                await sess.conversation.messages.init();
            }

            this.log.log('sess.conversation.messages', sess.conversation.messages);
            const msg = sess.conversation.messages.find(m => m.id === +dto.userMsgId);
            this.log.log('msg', msg);

            const agentResponse = sess.conversation.messages.find(m => m.id === +dto.responseMsgId);

            if (!msg) {
                throw new Error(`Message ${dto.userMsgId} not found`);
            }

            if(!agentResponse) {
                throw new Error(`Agent response message ${dto.responseMsgId} not found`);
            }

            const inbound: IInboundMessageEnvelope = {
                content: msg.content,
                context: dto.context,
                agentResponseMsgId: agentResponse.id,
                sessionId: dto.sessionId,
            };
            await this.msgBus.incoming(inbound, this);
        });
    }

    async onMessage(i: IInboundMessageEnvelope, o: IOutboundMessageEnvelope): Promise<void> {
    }
}