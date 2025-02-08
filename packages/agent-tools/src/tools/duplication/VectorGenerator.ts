import { Injectable } from "@nestjs/common";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ConfigService } from "@nestjs/config";
import { z } from "zod";

@Injectable()
export class VectorGenerator {

    model: OpenAIEmbeddings;
    constructor(
        readonly config: ConfigService
    ) {
        this.model = new OpenAIEmbeddings({
            openAIApiKey: this.config.getOrThrow("ai.embeddingApiKey")
        })
    }

    async invoke(args: {text: string}): Promise<number[]> {
        try {
            return await this.model.embedQuery(args.text);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}