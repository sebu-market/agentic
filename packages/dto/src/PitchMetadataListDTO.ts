import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";
import { PitchMetadataDTOSchema } from './PitchMetadataDTO';

export const PitchMetadataListDTOSchema = z.object({
    results: z.array(PitchMetadataDTOSchema).describe("List of pitches"),
});


export class PitchMetadataListDTO extends createZodDto(PitchMetadataListDTOSchema) {}

export type PitchMetadataList = z.infer<typeof PitchMetadataListDTOSchema>;