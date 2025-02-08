import { Global, Module } from "@nestjs/common";
import { comProviders } from "./services";

@Global()
@Module({
    providers: comProviders,
    exports: comProviders,
})
export class CommunicationsModule {}