import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { z, ZodSchema } from "zod";
import { Runnable } from "@langchain/core/runnables";
import { AScreeningSummarizer } from "../interfaces/AScreeningSummarizer";
import { ADataStoreFactory, APitchStore, AScreeningStore, ATokenMetaStore, AUserStore, Conversation, ConversationMessage, FounderInfo, Pitch, ProjectSummary, Screening, TokenMetadata } from "@sebu/db-models";
import { ALLMFactory } from "../interfaces";
import { PitchStatus, ScreeningStatus } from "@sebu/dto";
import { VectorGenerator } from "@sebu/agent-tools/dist/tools/duplication";

interface IMsgType {
    role: string;
    content: string;
}


@Injectable()
export class ScreeningSummarizer extends AScreeningSummarizer {
    
    outSchema: ZodSchema = z.object({
        tokenMetadata: z.object({
            chainId: z.number().describe("The chain id of the token provided by the user"),
            symbol: z.string().describe("The symbol of the token provided by token metadata tool"),
            address: z.string().describe("The address of the token"),
            name: z.string().describe("The name of the token provided by token metadata tool"),
            decimals: z.number().describe("The number of decimals for the token provided by token metadata tool"),
            volume_usd: z.number().optional().describe("The volume of the token in USD provided by token metadata tool"),
            marketCap: z.number().optional().describe("The market cap of the token in USD provided by token metadata tool"),
            price: z.number().optional().describe("The price of the token in USD provided by token metadata tool"),
        }), 
        summary: z.object({
            paymentConfirmed: z.boolean().optional().describe("Whether the payment has been confirmed for the pitch"),
            accepted: z.boolean().describe("Whether the project is allowed to be pitched to Sebu"),
            description: z.string().describe("Summary of the project"),
            projectName: z.string().describe("Name of the project"),
            pitcherName: z.string().describe("Name of the person pitching the project"),
            pitcherTwitterHandle: z.string().describe("Twitter handle of the person pitching the project"),
            pitcherRole: z.string().describe("Role of the person pitching the project"),
            duplicateScore: z.number().optional().describe("Confidence score of the duplicate detection algorithm"),
            duplicateName: z.string().optional().describe("Name of the duplicate project, if one exists"),
            duplicateDescription: z.string().optional().describe("Description of the duplicate project, if one exists"),
        }),
    });

    model?: Runnable;
    log: Logger = new Logger(ScreeningSummarizer.name);
    pitchTimeLimit: number = 10 * 60; 
    constructor(
        readonly config: ConfigService,
        readonly llmFactory: ALLMFactory,
        readonly ds: ADataStoreFactory,
        readonly embedding: VectorGenerator
    ) {
        super();
        const tl = config.get<number>('sebu.evaluation.timeLimitMinutes');
        if(tl) {
            this.pitchTimeLimit = tl * 60;
        }
    }

    setupModel(): void {
        if(this.model) {
            return;
        }
        this.model = this.llmFactory.getLLM().withStructuredOutput(this.outSchema);
    }

    async summarize(input: Screening): Promise<void> {
        this.setupModel();
        /*
        if(input.projectSummary) {
            return;
        }
            */
        
        const inputs = [
            {
                role: 'system',
                content: `
                    Your job is to summarize the details of a conversation with Aime, an 
                    executive assistant for Sebu, a high net worth crypto investor.

                    Use the context to extract the information needed to fill in the output schema information.

                    NOTE: Aime may suggest that the project is similar to another project 
                    but that doesn't mean she is rejecting the project. She will be very 
                    firm and clear about rejecting the project.

                    If she asks the user to make payment, it means she has accepted the project.
                `
            }
        ].concat(this.formatMessages(input));
        const result = (await this.model.invoke(inputs) as z.infer<typeof this.outSchema>);
        
        
        const summary = new ProjectSummary();
        const founder = new FounderInfo();
        
        let tokenMetadata = new TokenMetadata();
        tokenMetadata.symbol = result.tokenMetadata.symbol;
        tokenMetadata.address = result.tokenMetadata.address.toLowerCase();
        tokenMetadata.name = result.tokenMetadata.name;
        tokenMetadata.decimals = result.tokenMetadata.decimals;
        tokenMetadata.volume = result.tokenMetadata.volume_usd;
        tokenMetadata.market_cap = result.tokenMetadata.marketCap;
        tokenMetadata.price = result.tokenMetadata.price;
        tokenMetadata.chain = result.tokenMetadata.chainId;
        input.tokenMetadata = tokenMetadata;

        founder.name = result.summary.pitcherName;
        founder.role = result.summary.pitcherRole;
        founder.socialMedia = result.summary.pitcherTwitterHandle;
        summary.description = result.summary.description;
        summary.projectName = result.summary.projectName;
        summary.duplicateScore = result.summary.duplicateScore;
        summary.duplicateDescription = result.summary.duplicateDescription;
        summary.duplicateName = result.summary.duplicateName;
        input.projectSummary = summary;
        input.founderInfo = founder;

        console.log("Final result", result);

        if(result.summary.accepted) {
            if(result.summary.paymentConfirmed) {
                input.status = ScreeningStatus.ACCEPTED;
            } else {
                input.status = ScreeningStatus.PENDING_PAYMENT;
            }
        } else {
            input.status = ScreeningStatus.REJECTED;
        }
        await this.ds.readWriteContext(async (ctx) => {
            const store = ctx.getDataStore(AScreeningStore);
            await store.save(input);
        });
    }


    formatMessages(input: Screening): IMsgType[] {
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