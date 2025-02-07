import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";

export const SigVerificationRequestDTOSchema = z.object({
    signature: z.string().describe("Signature value"),
    message: z.string().describe("Signed message value generated from SiWE"),
});

export class SigVerificationRequestDTO extends createZodDto(SigVerificationRequestDTOSchema) {}

export type SigVerificationRequest = z.infer<typeof SigVerificationRequestDTOSchema>;