import { Module } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { SebuInfraModule } from "@sebu/infra";
import { ZodValidationPipe } from "nestjs-zod";
// import { AgentSendController } from "./AgentSendController";


const providers = [
    {
        provide: APP_PIPE,
        useClass: ZodValidationPipe,
    },
]

@Module({
    imports: [SebuInfraModule],
    providers: providers,
    controllers: [
      // AgentSendController
    ]
})
export class AppModule {}