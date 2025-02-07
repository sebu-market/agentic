import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";

export const MessageRequestDTOSchema = z.object({
    sessionId: z.number().describe("Pitch or Screening Session ID"),
    lastId: z.number().optional().describe("ID of the last message received"),
});

export class MessageRequestDTO extends createZodDto(MessageRequestDTOSchema) {}

export type MessageRequest = z.infer<typeof MessageRequestDTOSchema>
