import { Injectable, Logger } from "@nestjs/common";
import { APromptManager } from "../interfaces/APromptManager";
import { ChatPromptValueInterface } from "@langchain/core/prompt_values";
import { ASSMService } from "@sebu/ssm-service";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

@Injectable()
export class SSMPromptManager extends APromptManager {

    prompts: Map<string, string> = new Map();
    log: Logger = new Logger(SSMPromptManager.name);
    constructor(
        readonly ssm: ASSMService
    ) {
        super();
    }
    
    async generatePrompt(key: string, dynamicData?: any): Promise<ChatPromptValueInterface> {
        let content = this.prompts.get(key.toLowerCase());
        if(!content) {
            const v = await this.ssm.getParameter(key);
            if(!v) {
                throw new Error(`Prompt not found: ${key}`);
            }
            this.prompts.set(key.toLowerCase(), v);
            content = v;
        }
        let prompt = ChatPromptTemplate.fromMessages([
            {
                role: "system",
                content
            },
            new MessagesPlaceholder("context")
        ]);
        return await prompt.invoke(dynamicData);
    }

    async getSystemPrompt(key: string): Promise<string> {
        let content = this.prompts.get(key.toLowerCase());
        if(!content) {
            const v = await this.ssm.getParameter(key);
            if(!v) {
                throw new Error(`Prompt not found: ${key}`);
            }
            this.prompts.set(key.toLowerCase(), v);
            content = v;
        }
        return content;
    }
}