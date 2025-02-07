import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";

export const EntityByIDRequestDTOSchema = z.object({
    id: z.number().describe("entity ID"),
});

export class EntityByIDRequestDTO extends createZodDto(EntityByIDRequestDTOSchema) {}

export type EntityByIDRequest = z.infer<typeof EntityByIDRequestDTOSchema>
