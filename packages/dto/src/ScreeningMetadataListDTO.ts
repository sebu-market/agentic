import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";
import { ScreeningMetadataDTOSchema } from './ScreeningMetadataDTO';

export const ScreeningMetadataListDTOSchema = z.object({
    results: z.array(ScreeningMetadataDTOSchema).describe("List of screening metadata"),
});

export class ScreeningMetadataListDTO extends createZodDto(ScreeningMetadataListDTOSchema) {}

export type ScreeningMetadataList = z.infer<typeof ScreeningMetadataListDTOSchema>;