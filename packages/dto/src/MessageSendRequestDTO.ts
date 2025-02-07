import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";

export const MessageSendRequestDTOSchema = z.object({
    sessionId: z.number().describe("Pitch or Screening Session ID"),
    content: z.string().describe("Message content"),
    lastId: z.number().optional().describe("ID of the last message received"),
});

export class MessageSendRequestDTO extends createZodDto(MessageSendRequestDTOSchema) {}

export type MessageSendRequest = z.infer<typeof MessageSendRequestDTOSchema>;