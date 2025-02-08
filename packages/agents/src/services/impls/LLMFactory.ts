
import { Injectable } from '@nestjs/common';
import { ALLMFactory } from '../interfaces';
import { ConfigService } from '@nestjs/config';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';

@Injectable()
export class LLMFactory extends ALLMFactory {

    model?: BaseChatModel;
    constructor(
        readonly config: ConfigService
    ) {
        super();
    }

    getLLM(): BaseChatModel {
        if(!this.model) {
            const apiKey = this.config.getOrThrow<string>('ai.apiKey');
            const llm = this.config.getOrThrow<string>('ai.llm_provider');
            if(llm.toLowerCase() === 'openai') {
                this.model = new ChatOpenAI({
                    model: 'gpt-4o',
                    apiKey
                });
            } else {
                this.model = new ChatAnthropic({
                    model: 'claude-3-5-sonnet-20241022',
                    apiKey
                });
            }
        }
        return this.model!;
    }

}