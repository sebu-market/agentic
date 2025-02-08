import { Injectable } from "@nestjs/common";
import { AToolRepo, IAgentTool } from "../interfaces/AToolRepo";
import { StructuredToolInterface, tool } from "@langchain/core/tools";

@Injectable()
export class ToolRepo extends AToolRepo {
    tools: Map<string, IAgentTool<any>> = new Map();
    register(tool: IAgentTool<any>): void {
        console.log("Registering tool: ", tool.name);
        this.tools.set(tool.name, tool);
    }

    toLangchainTools(): StructuredToolInterface[] {
        const output: StructuredToolInterface[] = [];
        for(const t of this.tools.values()) {
            output.push(tool(async (input: any) => {
                return await t.invoke(input);
            }, {
                name: t.name,
                description: t.description,
                schema: t.schema,
            }));
        };
        return output;
    }
}