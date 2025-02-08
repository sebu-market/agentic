import { Module } from "@nestjs/common";
import { SebuConfigModule } from "@sebu/config";
import { ASQSService } from "./ASQSService";
//import { SQSService } from "./SQSService";
import { SQSPostingService } from "./SQSPostingService";

const providers = [
    {
        provide: ASQSService,
        //useClass: SQSService
        useClass: SQSPostingService
    }
];
@Module({
    imports: [SebuConfigModule],
    providers,
    exports: providers
})
export class SQSModule{};