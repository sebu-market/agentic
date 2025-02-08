import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { StructuredToolInterface, tool } from "@langchain/core/tools";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AToolRepo } from "@sebu/agent-tools";
import { AMessageBus, IInboundMessageEnvelope } from "@sebu/communication";
import { ADataStoreFactory, APitchStore, AScreeningStore, ConversationMessage, Screening } from "@sebu/db-models";
import { z, ZodSchema } from "zod";
import { ALLMFactory, APromptManager, AScreeningSummarizer, ContextFormatter } from "../../services";
import { AbstractAgent } from "../AbstractAgent";
import { ScreeningStatus } from "@sebu/dto";


const sebuInParams: ZodSchema = z.object({
    question: z.string().describe("The question to ask Aime, your executive assistant."),

});

type SebuInParams = z.infer<typeof sebuInParams>;
@Injectable()
export class Aime extends AbstractAgent {

    get context(): "pitch" | "screen" { return 'screen'; }
    get name(): string { return 'aime'; }
    systemPromptKey: string;
    sebuPromptKey: string;
    constructor(
        readonly llmFactory: ALLMFactory,
        readonly toolRepo: AToolRepo,
        readonly msgBus: AMessageBus,
        readonly formatter: ContextFormatter,
        readonly promptManager: APromptManager,
        readonly config: ConfigService,
        readonly ds: ADataStoreFactory,
        readonly summarizer: AScreeningSummarizer
    ) {
        super(llmFactory, toolRepo, msgBus, formatter);
        this.systemPromptKey = config.getOrThrow("aime.screening.promptKey");
        this.sebuPromptKey = config.getOrThrow("aime.assistant.promptKey");
    }

    asTool(): StructuredToolInterface {
        return tool(async (input: SebuInParams) => {
            return await this.respondToSebu(input.question);
        }, {
            name: 'aime',
            description: `Ask Aime, Sebu's executive assistant, a question.`,
            schema: sebuInParams,
        });
    }


    async processMessage(inMsg: IInboundMessageEnvelope, addUserMessage?: boolean): Promise<void> {
        
        console.log("Aime got inbound message", inMsg);

        const systemMsg = await this.promptManager.getSystemPrompt(this.systemPromptKey);
        const inputs = {
            messages: [{ role: "system", content: systemMsg }]
        };
        await this.ds.readWriteContext(async (ctx) => {
            const store = ctx.getDataStore(AScreeningStore);
            let screening = await store.findById(inMsg.sessionId, true);
            if(!screening) {
                throw new Error("Screening not found with id " + inMsg.sessionId);
            }
            if(!screening.conversation.messages.isInitialized(true)) {
                await screening.conversation.messages.init();
            }

            if(addUserMessage) {
                const c = new ConversationMessage();
                c.sender = 'user';
                c.role = 'user';
                c.content = inMsg.content;
                c.conversation = screening.conversation;
                screening.conversation.messages.add(c);
                screening = await store.save(screening);
            }

            const all = screening.conversation.messages.getItems();
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
        });

    
        console.log("Sending to aime", inputs);

        await this.sendToAime(inputs, inMsg);
    }

    async sendToAime(inputs: {messages: {role: string, content: string}[]}, inMsg: IInboundMessageEnvelope) {
        for await (
            const chunk of await this.model.stream(inputs, {
              streamMode: "updates",
            })
          ) {
            for (const [node, values] of Object.entries(chunk)) {
                switch(node) {
                    case 'agent': {
                        const {messages} = values as any;
                        console.log("Aime response messages", messages);
                        await this.handleAgentMessages(inMsg, messages);
                        break;
                    }
                    case 'tool':
                    case 'tools': {
                        const {messages} = values as any;
                        console.log("Tool response messages", messages);
                        await this.handleToolMessages(inMsg, messages);
                        break;
                    }
                    default: {
                        console.log(`Receiving update from unsupported node: ${node}`);
                        console.log(values);
                        console.log("\n====\n");
                    }
                }
            }
        }
    }

    async handleAgentMessages(inMsg: IInboundMessageEnvelope, messages: AIMessage[]) {
        messages = messages.filter(m => m.content.toString().trim().length > 0);
        if(messages.length === 0) {
            return;
        }
        let isComplete = false;
        let needsPayment = false;
        let scr: Screening = await this.ds.readWriteContext(async (ctx) => {
            const store = ctx.getDataStore(AScreeningStore);
            let screening = await store.findById(inMsg.sessionId, true);
            let firstMsg: ConversationMessage | undefined = undefined;
            if(inMsg.agentResponseMsgId) {
                const hit = await screening.conversation.messages.find(m => m.id === inMsg.agentResponseMsgId);
                if(hit && hit.content.trim().length === 0) {
                    firstMsg = hit;
                }
            }
            
            for(const m of messages) {
                const content = m.content.toString();
                const isLast = content.indexOf("::END::") >= 0;
                const np = content.indexOf("::PAYMENT::") >= 0;
                if(!needsPayment && needsPayment !== np) {
                    needsPayment = np;
                }
                const requiresResponse = !isLast;
                if(!isComplete && isLast) {
                    isComplete = isLast;
                }
                if(firstMsg) {
                    firstMsg.content = m.content.toString();
                    firstMsg.sender = this.name;
                    firstMsg.isLast = isLast;
                    firstMsg.requiresResponse = requiresResponse;
                    screening.conversation.messages.add(firstMsg);
                    firstMsg = undefined;
                } else {
                    const c = new ConversationMessage();
                    c.sender = this.name;
                    c.role = 'assistant';
                    c.content = m.content.toString();
                    c.conversation = screening.conversation;
                    c.isLast = isLast;
                    c.requiresResponse = requiresResponse;
                    screening.conversation.messages.add(c);
                }
            }
            screening = await store.save(screening);
            return screening;
        });
        if(isComplete || needsPayment) {
            if(needsPayment) {
                scr.status = ScreeningStatus.PENDING_PAYMENT;
            }
            await this.summarizer.summarize(scr);
        }
    }

    async handleToolMessages(inMsg: IInboundMessageEnvelope, messages: ToolMessage[]) {
        await this.ds.readWriteContext(async (ctx) => {
            const store = ctx.getDataStore(AScreeningStore);
            let screening = await store.findById(inMsg.sessionId, true);
            for(const m of messages) {
                const c = new ConversationMessage();
                c.sender = `Tool: ${m.name}`;
                c.role = 'assistant';
                c.content = m.content.toString();
                c.conversation = screening.conversation;
                c.isLast = false;
                c.isInjected = true;
                c.requiresResponse =  false;
                screening.conversation.messages.add(c);
            }
            await store.save(screening);
        });
    }

    async respondToSebu(question: string): Promise<any> {
        let [currentMessages, pitch] = await this.ds.readOnlyContext(async (ctx) => {
            const store = ctx.getDataStore(APitchStore);
            const live = await store.findActivePitch();
            if(!live) {
                throw new Error("No active pitch found.");
            }
            if(!live.conversation.messages.isInitialized(true)) {
                await live.conversation.messages.init();
            }
            return [live.conversation.messages.getItems(), live];
        });
        currentMessages.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
        const inputs = [
            {
                role: 'system',
                content: await this.promptManager.getSystemPrompt(this.sebuPromptKey)
            }
        ].concat(currentMessages.map(m => {
            return { role: m.role, content: m.content };
        })).concat([{
            role: 'assistant',
            content: `Question from Sebu: ${question}`
        }]);

        return await this.model.invoke(inputs);
    }
}