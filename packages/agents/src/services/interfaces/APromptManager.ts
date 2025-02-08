import { ChatPromptValueInterface } from "@langchain/core/prompt_values";



/**
 * Prompt manager is responsible for getting prompt data for an agent and filling in contextual
 * data. Contextual data is prompt-dependent and the agent makes some assumptions about what information
 * is needed in every prompt. The prompt is kept secret and separate from the application code since
 * understanding the prompt could lead to attacks on the agent.
 */
export abstract class APromptManager {

    /**
     * Generate a prompt for the given key and dynamic data. The key should be globally unique 
     * and match what the prompt manager uses to store/retrieve the prompt from its source.
     * 
     * @param key 
     * @param dynamicData 
     */
    abstract generatePrompt(key: string, dynamicData?: any): Promise<ChatPromptValueInterface>;

    abstract getSystemPrompt(key: string): Promise<string>;
}