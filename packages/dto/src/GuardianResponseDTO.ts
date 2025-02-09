import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";

export const GuardianResponseDTOSchema = z.object({
    content: z.string().describe("Message content"),
});

export class GuardianResponseDTO extends createZodDto(GuardianResponseDTOSchema) {}

export type GuardianResponse = z.infer<typeof GuardianResponseDTOSchema>
