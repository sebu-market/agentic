import { Runnable } from "@langchain/core/runnables";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VectorGenerator } from "@sebu/agent-tools/dist/tools/duplication";
import { ADataStoreFactory, APitchStore, Pitch, TokenEvaluation } from "@sebu/db-models";
import { PitchStatus } from "@sebu/dto";
import { z, ZodSchema } from "zod";
import { ALLMFactory } from "../interfaces";
import { APitchSummarizer } from "../interfaces/APitchSummarizer";

interface IMsgType {
    role: string;
    content: string;
}


@Injectable()
export class PitchSummarizer extends APitchSummarizer {
    
    
    outSchema: ZodSchema = z.object({
        apingIn: z.boolean().describe("Whether you would be willing to invest in the project"),
        score: z.number().int().min(0).max(1000).describe("A score from 0-100 on how likely the project is to moon"),
        bullishFactors: z.array(z.string()).describe("A list of factors that make you bullish on the project"),
        redFlags: z.array(z.string()).describe("A list of factors that concern you most")
    });

    model?: Runnable;
    log: Logger = new Logger(PitchSummarizer.name);
    constructor(
        readonly config: ConfigService,
        readonly llmFactory: ALLMFactory,
        readonly ds: ADataStoreFactory,
        readonly embedding: VectorGenerator
    ) {
        super();
    }

    setupModel(): void {
        if(this.model) {
            return;
        }
        this.model = this.llmFactory.getLLM().withStructuredOutput(this.outSchema);
    }

    async summarizePitch(pitch: Pitch): Promise<void> {
        this.setupModel();
        
        const inputs = [
            {
                role: 'system',
                content: `Use the conversation messages to fill in the output schema information`
            }
        ].concat(this.formatMessages(pitch));
        const response = (await this.model.invoke(inputs) as z.infer<typeof this.outSchema>);
        
        const evaluation = new TokenEvaluation();
        evaluation.apingIn = response.apingIn;
        evaluation.moonPotentialScore = response.score;
        evaluation.confidence = 100;
        evaluation.bullishFactors = response.bullishFactors;
        evaluation.redFlags = response.redFlags;
        pitch.evaluation = evaluation;
        pitch.status = PitchStatus.EVALUATED;
        pitch = await this.ds.readWriteContext(async (ctx) => {
            const store = ctx.getDataStore(APitchStore);
            return await store.save(pitch);
        });
        
        //FIXME: send off request to move to next slot on chain
    }

    

    formatMessages(input: Pitch): IMsgType[] {
        const outs: IMsgType[] = [];
        const all = input.conversation.messages.getItems();
        all.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
        for(const m of all) {
            if(m.content.trim().length === 0) {
                continue;
            }
            outs.push({ role: m.role, content: m.content });
        }
        if(outs[outs.length - 1].role === 'assistant') {
            outs.push({ role: 'user', content: 'please continue' });
        }
        return outs;
    }
}