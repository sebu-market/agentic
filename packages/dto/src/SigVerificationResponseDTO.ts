import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";

export const SigVerificationResponseDTOSchema = z.object({
    address: z.string().describe("Resulting wallet address from signature"),
    chainId: z.number().describe("Resulting chainId from signature"),
});

export class SigVerificationResponseDTO extends createZodDto(SigVerificationResponseDTOSchema) {}

export type SigVerificationResponse = z.infer<typeof SigVerificationResponseDTOSchema>;