import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const SebuSessionCookieDataSchema = z.object({
    nonce: z.string().min(8, "Invalid nonce").optional().describe("Nonce value for the session"),
    address: z.string().min(42, "Invalid wallet address").max(42, "Invalid wallet address").optional().describe("Address of the user"),
    chainId: z.number().min(1, "Invalid chain id").optional().describe("Chain ID of the user"),
});

export class SebuSessionCookieData extends createZodDto(SebuSessionCookieDataSchema) {}

export type SebuSessionCookie = z.infer<typeof SebuSessionCookieDataSchema>;