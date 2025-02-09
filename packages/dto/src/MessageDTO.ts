import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";

export const MessageDTOSchema = z.object({
    id: z.number().describe("Message ID"),
    content: z.string().describe("Message content"),
    isInjected: z.boolean().describe("Is this message injected"),
    sender: z.string().describe("Message sender"),
    role: z.string().describe("Message role"),
    timestamp: z.string().describe("Message timestamp"),
    requiresResponse: z.boolean().describe("Message requires response"),
    last: z.boolean().describe("Is this the last message in the conversation")
});

export class MessageDTO extends createZodDto(MessageDTOSchema) {}

export type Message = z.infer<typeof MessageDTOSchema>
