import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";
import { ScreeningStatus } from "./ScreeningStatus";

export const ScreeningMetadataDTOSchema = z.object({
    id: z.number().describe("Unique identifier for the screening metadata"),
    timeRemaining: z.number().describe("Seconds remaining for the screening session"),
    status: z.enum([ScreeningStatus.LIVE, ScreeningStatus.ACCEPTED, ScreeningStatus.REJECTED]).describe("Current status of the screening"),
    owner_address: z.string().describe("Address of the owner of the screening"),
    nextPitchId: z.number().optional().describe("Next pitch ID to be evaluated"),
    finalEval: z.any().optional().describe("Final evaluation of the screening"),
});

export class ScreeningMetadataDTO extends createZodDto(ScreeningMetadataDTOSchema) {}

export type ScreeningMetadata = z.infer<typeof ScreeningMetadataDTOSchema>;