import { Body, Controller, Post } from "@nestjs/common";
import { AgentLambdaRequest } from "@sebu/dto";
import { AgentForwardingService } from "@sebu/infra/dist/services";

@Controller('agent')
export class AgentSendController {

    constructor(
        private agentCaller: AgentForwardingService) {
    }

    @Post('send')
    async send(
        @Body() dto: AgentLambdaRequest): Promise<any> {
        console.log("AgentSenderController.send", dto);
        return await this.agentCaller.callAgent(dto);
    }
}