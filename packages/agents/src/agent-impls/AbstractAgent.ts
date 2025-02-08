import { CompiledStateGraph } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AToolRepo } from '@sebu/agent-tools';
import { AMessageBus, IInboundMessageEnvelope, IOutboundMessageEnvelope } from '@sebu/communication';
import { ConversationMessage, Pitch, Screening } from '@sebu/db-models';
import { ALLMFactory, ContextFormatter } from '../services';


export interface ISendMsgRequest {
    inbound: IInboundMessageEnvelope;
    outbound: IOutboundMessageEnvelope;
}

export type AddMessageCallback<T extends Pitch | Screening> = (msg: ConversationMessage) => Promise<T>;
export interface IAddAgentMessageOpts<T extends Pitch | Screening> {
    session:T;
    responsePlaceholder?: ConversationMessage;
    content: string;
    sender: string;
    last?: boolean;
    requiresResponse?: boolean;
    injected?: boolean;
}

export abstract class AbstractAgent implements OnModuleInit, OnModuleDestroy {


    protected model?: CompiledStateGraph<any,any>;
    constructor(
        readonly llmFactory: ALLMFactory,
        readonly toolRepo: AToolRepo,
        readonly msgBus: AMessageBus,
        readonly formatter: ContextFormatter
    ) {
        
    }

    abstract processMessage(msg: IInboundMessageEnvelope, addUserMessage?: boolean): Promise<void>;
    abstract get context(): 'pitch' | 'screen';
    abstract get name(): string;

    protected setupAgent(): void {
        if(this.model) {
            return;
        }
        const llm = this.llmFactory.getLLM();
        const tools = this.toolRepo.toLangchainTools();
        this.model = createReactAgent({
            llm,
            tools
        });
    }

    getTimeRemaining(state: Pitch | Screening): number {
        const elapsedSeconds = (Date.now() - state.startTime.getTime()) / 1000.0;
        return Math.max(0, state.timeLimitSeconds - elapsedSeconds);
    }

    
    async addAgentMessage<T extends Pitch | Screening> (opts: IAddAgentMessageOpts<T>, addMessageCallback: AddMessageCallback<T>): Promise<T> {
        let msg: ConversationMessage = opts.responsePlaceholder || new ConversationMessage();
        msg.content = opts.content;
        msg.conversation = opts.session.conversation;
        msg.role = 'assistant';
        msg.sender = opts.sender;
        msg.isInjected = opts.injected;
        msg.requiresResponse = opts.requiresResponse;
        msg.isLast = opts.last;
        return await addMessageCallback(msg);
    }

    async onModuleInit() {
        if(!this.context) {
            throw new Error("context must be set");
        }
        this.msgBus.subscribe(this);
    }

    async onModuleDestroy() {
        if(this.context) {
            this.msgBus.unsubscribe(this);
        }
    }

    async onMessage(msg: IInboundMessageEnvelope): Promise<void> {
        this.setupAgent();
        
        try {
            await this.processMessage(msg);
        } catch (e) {
            console.error(e);
            await this.sendMessageToUser({
                inbound: msg,
                outbound: {
                    content: 'Sorry, I am having some issues right now. Please try again later.',
                    last: true,
                    requiresResponse: false,
                    sessionId: msg.sessionId
                } as IOutboundMessageEnvelope
           });
        }
    }

    protected async sendMessageToUser(req: ISendMsgRequest): Promise<void> {
        await this.msgBus.outgoing(req.inbound, req.outbound);
    }
}