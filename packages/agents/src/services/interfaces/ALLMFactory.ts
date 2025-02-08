
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export abstract class ALLMFactory {
    abstract getLLM(): BaseChatModel;
}