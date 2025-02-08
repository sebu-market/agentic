import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";
import { PitchStatus } from './PitchStatus';

export const PaymentMetadataDTOSchema = z.object({
    txnHash: z.string().optional().describe("Transaction hash of the payment"),
    amount: z.number().describe("Amount paid for the pitch"),
    payDate: z.coerce.date().describe("Date of the payment"),
    slotNumber: z.number().describe("Slot number for the pitch"),
    roundNumber: z.number().describe("Round number for the pitch"),
});

export const ProjectSummaryDTOSchema = z.object({
    description: z.string().describe("Description of the project"),
    projectName: z.string().describe("Name of the project"),
    duplicateScore: z.number().default(0).describe("relative similarity score of another project"),
    duplicateName: z.string().default('').describe("Name of the most similar project"),
    duplicateDescription: z.string().default('').describe("Description of the duplicate project"),
});

export const FounderInfoDTOSchema = z.object({
    name: z.string().describe("Name of the founder"),
    role: z.string().describe("Role of the founder"),
});

export const PitchMetadataDTOSchema = z.object({
    id: z.number().describe("Unique identifier for the pitch metadata"),
    timeRemaining: z.number().min(0).describe("Seconds remaining for the pitch session"),
    status: z.enum([PitchStatus.PENDING_PAYMENT, PitchStatus.QUEUED, PitchStatus.LIVE, PitchStatus.EVALUATED, PitchStatus.LIVE, PitchStatus.COMPLETED]).describe("Current status of the pitch"),
    owner_address: z.string().describe("Address of the owner of the pitch"),
    sourceScreeningId: z.number().describe("ID of the screening that accepted the pitch"),
    payment: PaymentMetadataDTOSchema.optional().describe("Payment information for the pitch"),
    finalEval: z.any().optional().describe("Final token evaluation of the pitch"),
    projectSummary: ProjectSummaryDTOSchema.optional().describe("Project summary of the pitch"),
    founderInfo: FounderInfoDTOSchema.optional().describe("Founder information"),
    tokenMetadata: z.object({
        chainId: z.number().describe("The chain id of the token provided by the user"),
        symbol: z.string().describe("The symbol of the token provided by token metadata tool"),
        address: z.string().describe("The address of the token"),
        name: z.string().describe("The name of the token provided by token metadata tool"),
        decimals: z.number().describe("The number of decimals for the token provided by token metadata tool"),
        volume_usd: z.number().optional().describe("The volume of the token in USD provided by token metadata tool"),
        marketCap: z.number().optional().describe("The market cap of the token in USD provided by token metadata tool"),
        price: z.number().optional().describe("The price of the token in USD provided by token metadata tool"),
    }).optional().describe("Token metadata"),  
});

export class PitchMetadataDTO extends createZodDto(PitchMetadataDTOSchema) {}

export type PitchMetadata = z.infer<typeof PitchMetadataDTOSchema>;