
import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";

export const NonceResponseDTOSchema = z.object({
    nonce: z.string().describe("Nonce value")
});

export class NonceResponseDTO extends createZodDto(NonceResponseDTOSchema) {}

export type NonceResponse = z.infer<typeof NonceResponseDTOSchema>;