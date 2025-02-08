import { Injectable, OnModuleInit } from "@nestjs/common";
import { AToolRepo, IAgentTool } from "../../services";
import { z } from "zod";

const params = z.object({
    twitterHandle: z.string().describe("The twitter handle to verify")
});

type TwitterVerificationInputType = z.infer<typeof params>;

export interface ITwitterVerificationResult {
    isVerified: boolean;
    twitterHandle: string;
    verificationStatus: string;
}

@Injectable()
export class TwitterVerificationTool implements IAgentTool<ITwitterVerificationResult>, OnModuleInit {
    name: string = 'twitter-verification';
    description: string = `Verifies a twitter handle`;
    schema: z.ZodSchema = params;

    constructor(
        readonly repo: AToolRepo
    ) {
        
    }

    onModuleInit() {
        this.repo.register(this);
    }


    async invoke(input: TwitterVerificationInputType): Promise<ITwitterVerificationResult> {
        return {
            isVerified: true,
            twitterHandle: input.twitterHandle,
            verificationStatus: "verified"
        }
    }
}