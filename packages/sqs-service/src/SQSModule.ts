import { DynamicModule, Module } from "@nestjs/common";
import { SebuConfigModule } from "@sebu/config";
import { ASQSService } from "./ASQSService";
import { SQSPostingService } from "./SQSPostingService";
import { SQSService } from "./SQSService";

@Module({
})
export class SQSModule{

    static forRoot(): DynamicModule {
        const isDev = process.env.NODE_ENV === "development";
        const providers = [
            {
                provide: ASQSService,
                useClass: isDev ? SQSPostingService : SQSService
            }
        ];
        return {
            module: SQSModule,
            imports: [SebuConfigModule],
            providers,
            exports: providers
        }
    }
};