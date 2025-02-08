import { StructuredToolInterface } from '@langchain/core/tools';
import { ZodSchema } from 'zod';

export interface IAgentTool<O> {
    name: string;
    description: string;
    schema: ZodSchema;
    invoke: (input: any) => Promise<O>;
}

export abstract class AToolRepo {

    abstract register<O>(tool: IAgentTool<O>): void;
    abstract toLangchainTools(): StructuredToolInterface[];
}