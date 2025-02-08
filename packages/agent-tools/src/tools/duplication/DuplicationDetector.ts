import { Injectable, OnModuleInit } from "@nestjs/common";
import { ADataStoreFactory, APitchStore } from '@sebu/db-models';
import { z, ZodSchema } from "zod";
import { AToolRepo, IAgentTool } from "../../services";
import { VectorGenerator } from "./VectorGenerator";


const params = z.object({
    projectDescription: z.string().describe("The user's description of their token project")
});

type DuplicationInputType = z.infer<typeof params>;

export interface IDuplicationResult {
    isDuplicate: boolean;
    duplicateName: string;
    duplicateDescription: string;
    confidence: number;
}

@Injectable()
export class DuplicationDetector implements IAgentTool<IDuplicationResult>, OnModuleInit {

    name: string = 'duplication-detector';
    description: string = `Detects whether a project description is simular to projects Sebu has already seen`;
    schema: ZodSchema = params;

    constructor(
        readonly repo: AToolRepo,
        readonly ds: ADataStoreFactory,
        readonly embedding: VectorGenerator
    ) {
        
    }

    async invoke(input: DuplicationInputType): Promise<IDuplicationResult> {
        try {
            const r = await this.embedding.invoke({text: input.projectDescription});
            const reply = await this.ds.readOnlyContext(async (ctx) => {
                const store = ctx.getDataStore(APitchStore);
                let p = await store.findSimilarPitch(r, .85);
                if(p.length > 0) {
                    const closest = await store.findById(p[0].id);
                    return {
                        confidence: p[0].similarity,
                        isDuplicate: true,
                        duplicateDescription: closest.projectSummary.description,
                        duplicateName: closest.projectSummary.projectName
                    }
                }
            });
            if(reply) {
                return reply;
            }
        } catch (e) {
            console.log(e);
        }

        return {
            confidence: 0,
            isDuplicate: false,
            duplicateDescription: "none",
            duplicateName: "none"
        };
    }

    async onModuleInit() {
        this.repo.register(this);
    }

}