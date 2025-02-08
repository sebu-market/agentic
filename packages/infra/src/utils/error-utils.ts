import { ErrorDTOSchema } from "@sebu/dto";

/**
 * Converts any throwable into a error object with a message
 * @param original 
 */
export function toErrorWithMessage(original: any) {
    if (original instanceof Error && original.message) {
        return original;
    }
    return new Error(original?.message || original || "Unknown error");
}


/**
 * Converts any throwable into a ErrorDTO object
 * @param original 
 * @param code 
 */
export function toErrorDTO(original: any, code: number = 500) {
    const err = toErrorWithMessage(original);
    // console.log({
    //     msg: "toErrorDTO",
    //     err,
    //     message: err.message,
    // })
    return ErrorDTOSchema.parse({
        code,
        error: err.message
    });
}
