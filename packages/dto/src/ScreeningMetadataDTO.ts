import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";
import { ScreeningStatus } from "./ScreeningStatus";

export const ScreeningMetadataDTOSchema = z.object({
    id: z.number().describe("Unique identifier for the screening metadata"),
    timeRemaining: z.number().describe("Seconds remaining for the screening session"),
    status: z.enum([ScreeningStatus.LIVE, ScreeningStatus.PENDING_PAYMENT, ScreeningStatus.ACCEPTED, ScreeningStatus.REJECTED]).describe("Current status of the screening"),
    owner_address: z.string().describe("Address of the owner of the screening"),
    nextPitchId: z.number().optional().describe("Next pitch ID to be evaluated"),
    finalEval: z.any().optional().describe("Final evaluation of the screening"),
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

export class ScreeningMetadataDTO extends createZodDto(ScreeningMetadataDTOSchema) {}

export type ScreeningMetadata = z.infer<typeof ScreeningMetadataDTOSchema>;