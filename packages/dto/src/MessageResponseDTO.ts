import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";
import { MessageDTOSchema } from "./MessageDTO";

export const MessageResponseDTOSchema = z.object({
    messages: z.array(MessageDTOSchema).describe("Array of messages"),
});

export class MessageResponseDTO extends createZodDto(MessageResponseDTOSchema) {}

export type MessageResponse = z.infer<typeof MessageResponseDTOSchema>;
