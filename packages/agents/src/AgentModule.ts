import { Module } from "@nestjs/common";
import { allServices } from "./services";
import { SebuConfigModule } from "@sebu/config";
import { StorageModule } from "@sebu/db-models";
import { SSMModule } from "@sebu/ssm-service";
import { CommunicationsModule } from "@sebu/communication";
import { allAgents } from "./agent-impls";
import { ToolsModule } from "@sebu/agent-tools";

const providers = [
    ...allServices,
    ...allAgents
]
@Module({
    imports: [
        SebuConfigModule,
        CommunicationsModule,
        StorageModule.registerAsync(),
        ToolsModule,
        SSMModule
    ],
    providers,
    exports: providers
})
export class AgentModule {}