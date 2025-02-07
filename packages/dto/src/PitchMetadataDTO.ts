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

export const PitchMetadataDTOSchema = z.object({
    id: z.number().describe("Unique identifier for the pitch metadata"),
    timeRemaining: z.number().min(0).describe("Seconds remaining for the pitch session"),
    status: z.enum([PitchStatus.PENDING_PAYMENT, PitchStatus.QUEUED, PitchStatus.LIVE, PitchStatus.EVALUATED, PitchStatus.LIVE, PitchStatus.COMPLETED]).describe("Current status of the pitch"),
    owner_address: z.string().describe("Address of the owner of the pitch"),
    sourceScreeningId: z.number().describe("ID of the screening that accepted the pitch"),
    payment: PaymentMetadataDTOSchema.optional().describe("Payment information for the pitch"),
    finalEval: z.any().optional().describe("Final token evaluation of the pitch"),
});

export class PitchMetadataDTO extends createZodDto(PitchMetadataDTOSchema) {}

export type PitchMetadata = z.infer<typeof PitchMetadataDTOSchema>;