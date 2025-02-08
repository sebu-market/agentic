
import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AToolRepo } from "@sebu/agent-tools";
import { AMessageBus, IInboundMessageEnvelope } from "@sebu/communication";
import { ADataStoreFactory, APitchStore, ConversationMessage, Pitch } from "@sebu/db-models";
import { ALLMFactory, APitchSummarizer, APromptManager, ContextFormatter } from "../../services";
import { AbstractAgent } from "../AbstractAgent";
import { Aime } from "../aime/Aime";
import { PitchStatus } from "@sebu/dto";

@Injectable()
export class Sebu extends AbstractAgent {

    get context(): "pitch" | "screen" { return 'pitch'; }
    get name(): string { return 'sebu'; }
    systemPromptKey: string;
    log: Logger = new Logger(Sebu.name);
    constructor(
        readonly llmFactory: ALLMFactory,
        readonly toolRepo: AToolRepo,
        readonly msgBus: AMessageBus,
        readonly formatter: ContextFormatter,
        readonly promptManager: APromptManager,
        readonly config: ConfigService,
        readonly ds: ADataStoreFactory,
        readonly summarizer: APitchSummarizer,
        readonly aime: Aime
    ) {
        super(llmFactory, toolRepo, msgBus, formatter);
        this.systemPromptKey = config.getOrThrow("sebu.investor.promptKey");
    }


    override setupAgent(): void {
        if(this.model) {
            return;
        }
        const llm = this.llmFactory.getLLM();

        //Add Aime as a tool available to Sebu
        let tools = this.toolRepo.toLangchainTools().concat([this.aime.asTool()]);
        
        this.model = createReactAgent({
            llm,
            tools
        });
    }

    
    async processMessage(inMsg: IInboundMessageEnvelope, addUserMessage?: boolean): Promise<void> {
        
        this.log.log({
            msg: "Sebu got inbound message", 
            inMsg
        });

        const systemMsg = await this.promptManager.getSystemPrompt(this.systemPromptKey);
        const inputs = {
            messages: [{ role: "system", content: systemMsg }]
        };
        const pitch = await this.ds.readWriteContext(async (ctx) => {
            const store = ctx.getDataStore(APitchStore);
            let live = await store.findActivePitch();
            if(!live) {
                throw new Error("Active pitch not found ");
            }
            if(!live.startTime) {
                live.startTime = new Date();
            }

            if(!live.conversation.messages.isInitialized(true)) {
                await live.conversation.messages.init();
            }
            if(live.id !== inMsg.sessionId) {
                this.log.warn("!!!!!!!!!!!!! Active pitch id does not match inbound message id");
            }

            if(addUserMessage) {
                const c = new ConversationMessage();
                c.sender = 'user';
                c.role = 'user';
                c.content = inMsg.content;
                c.conversation = live.conversation;
                live.conversation.messages.add(c);
                live = await store.save(live);
            }

            const all = live.conversation.messages.getItems();
            all.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
            for(const m of all) {
                if(m.content.trim().length === 0) {
                    continue;
                }
                inputs.messages.push({ role: m.role, content: m.content });
            }
            if(inputs.messages[inputs.messages.length - 1].role === 'assistant') {
                inputs.messages.push({ role: 'user', content: 'please continue' });
            }
            return live;
        });

    
        console.log("Sending to sebu", inputs);

        
        for await (
            const chunk of await this.model.stream(inputs, {
              streamMode: "updates",
            })
          ) {
            for (const [node, values] of Object.entries(chunk)) {
                switch(node) {
                    case 'agent': {
                        const {messages} = values as any;
                        await this.handleAgentMessages(inMsg, pitch, messages);
                        break;
                    }
                    case 'tool':
                    case 'tools': {
                        const {messages} = values as any;
                        await this.handleToolMessages(inMsg, pitch, messages);
                        break;
                    }
                    default: {
                        console.log(`Receiving update from unsupported node: ${node}`);
                        console.log(values);
                        console.log("\n====\n");
                    }
                }
              console.log(`Receiving update from node: ${node}`);
              console.log(values);
              console.log("\n====\n");
            }
        }
    }

    /**
     * This is called by the lambda watchdog when it finds the current live pitch to have expired
     * without completing.
     * 
     * @param pitch 
     * @returns 
     */
    async finishEvaluation(pitch: Pitch): Promise<void> {
        this.setupAgent();

        const systemMsg = await this.promptManager.getSystemPrompt(this.systemPromptKey);
        const inputs = {
            messages: [{ role: "system", content: systemMsg }]
        };

        await this.ds.readWriteContext(async (ctx) => {
            const store = ctx.getDataStore(APitchStore);
            if(pitch.status === PitchStatus.COMPLETED) {
                return;
            }
            const uc = new ConversationMessage();
            uc.sender = 'user';
            uc.role = 'user';
            uc.content = "I've been disconnected, please provide a final evaluation with what you have";
            uc.conversation = pitch.conversation;
            uc.isLast = false;
            uc.requiresResponse = false;
            uc.isInjected = true;
            if(!pitch.conversation.messages.isInitialized(true)) {
                await pitch.conversation.messages.init();
            }
            pitch.conversation.messages.add(uc);
            pitch = await store.save(pitch);
        });

        const all = pitch.conversation.messages.getItems();
        all.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
        for(const m of all) {
            if(m.content.trim().length === 0) {
                continue;
            }
            inputs.messages.push({ role: m.role, content: m.content });
        }
        if(inputs.messages[inputs.messages.length - 1].role === 'assistant') {
            inputs.messages.push({ role: 'user', content: 'please continue' });
        }

        const inMsg: IInboundMessageEnvelope = {
            sessionId: pitch.id,
            content: "",
            context: "pitch",
            agentResponseMsgId: undefined
        }
        
        for await (
            const chunk of await this.model.stream(inputs, {
              streamMode: "updates",
            })
          ) {
            for (const [node, values] of Object.entries(chunk)) {
                switch(node) {
                    case 'agent': {
                        const {messages} = values as any;
                        await this.handleAgentMessages(inMsg, pitch, messages);
                        break;
                    }
                    case 'tool':
                    case 'tools': {
                        const {messages} = values as any;
                        await this.handleToolMessages(inMsg, pitch, messages);
                        break;
                    }
                    default: {
                        console.log(`Receiving update from unsupported node: ${node}`);
                        console.log(values);
                        console.log("\n====\n");
                    }
                }
              console.log(`Receiving update from node: ${node}`);
              console.log(values);
              console.log("\n====\n");
            }
        }
    }

    async handleAgentMessages(inMsg: IInboundMessageEnvelope, pitch: Pitch, messages: AIMessage[]) {
        messages = messages.filter(m => m.content.toString().trim().length > 0);
        if(messages.length === 0) {
            return;
        }
        let isComplete = false;
        
        pitch = await this.ds.readWriteContext(async (ctx) => {
            const store = ctx.getDataStore(APitchStore);
            let firstMsg: ConversationMessage | undefined = undefined;
            if(inMsg.agentResponseMsgId) {
                const hit = await pitch.conversation.messages.find(m => m.id === inMsg.agentResponseMsgId);
                if(hit && hit.content.trim().length === 0) {
                    firstMsg = hit;
                }
            }
            
            for(const m of messages) {
                const content = m.content.toString();
                const isLast = content.indexOf("::END::") >= 0;
                const requiresResponse = !isLast;
                if(!isComplete && isLast) {
                    isComplete = isLast;
                }
                if(firstMsg) {
                    firstMsg.content = m.content.toString();
                    firstMsg.isLast = isLast;
                    firstMsg.requiresResponse = requiresResponse;
                    pitch.conversation.messages.add(firstMsg);
                    firstMsg = undefined;
                } else {
                    const c = new ConversationMessage();
                    c.sender = this.name;
                    c.role = 'assistant';
                    c.content = m.content.toString();
                    c.conversation = pitch.conversation;
                    c.isLast = isLast;
                    c.requiresResponse = requiresResponse;
                    pitch.conversation.messages.add(c);
                }
            }
            pitch = await store.save(pitch);
            return pitch;
        });
        
        if(isComplete) {
            await this.summarizer.summarizePitch(pitch);
        }
    }

    async handleToolMessages(inMsg: IInboundMessageEnvelope, pitch: Pitch, messages: ToolMessage[]) {
        await this.ds.readWriteContext(async (ctx) => {
            const store = ctx.getDataStore(APitchStore);
            for(const m of messages) {
                const c = new ConversationMessage();
                c.sender = `Tool: ${m.name}`;
                c.role = 'assistant';
                c.content = m.content.toString();
                c.conversation = pitch.conversation;
                c.isLast = false;
                c.isInjected = true;
                c.requiresResponse =  false;
                pitch.conversation.messages.add(c);
            }
            await store.save(pitch);
        });
    }


}