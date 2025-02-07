import { createZodDto } from 'nestjs-zod/dto'
import { z } from "zod";


export const AgentLambdaRequestDTOSchema = z.object({
    sessionId: z.number().describe("Pitch or Screening Session ID"),
    userMsgId: z.number().describe("The message sent by the user to the agent"),
    responseMsgId: z.number().describe("The message placeholder for the agent response to the user"),
    context: z.enum(['pitch', 'screen']).describe("Context of the agent lambda"),
});

export class AgentLambdaRequestDTO extends createZodDto(AgentLambdaRequestDTOSchema) {}

export type AgentLambdaRequest = z.infer<typeof AgentLambdaRequestDTOSchema>
