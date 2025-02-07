
import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";

export const ErrorDTOSchema = z.object({
    code: z.number().describe("Error code"),
    error: z.string().describe("Error message"),
});

export class ErrorDTO extends createZodDto(ErrorDTOSchema) {}

export type ApiError = z.infer<typeof ErrorDTOSchema>

/**
 * Note, using this method, to create an ErrorDTO instance, you would do this:
 * const err = ErrorDTOSchema.parse({ code: 404, error: "Not Found" });
 */