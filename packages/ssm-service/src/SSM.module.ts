import { Module } from "@nestjs/common";
import { ASSMService } from "./ASSM.service";
import { SSMService } from "./SSM.service";
import {SebuConfigModule} from "@sebu/config";

const providers = [
    {
        provide: ASSMService,
        useClass: SSMService
    }
];
@Module({
    imports: [
        SebuConfigModule
    ],
    providers,
    exports: providers
})
export class SSMModule {};