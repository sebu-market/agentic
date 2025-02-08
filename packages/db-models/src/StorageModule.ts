import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SebuConfigModule } from "@sebu/config";
import { ADistributedLock, DistributedLock } from "./locks";
import ORMConfigurationOptions from "./mikro-orm.config";
import { storeProviders } from "./stores";

@Global()
@Module({})
export class StorageModule {

    static async registerAsync(): Promise<DynamicModule> {

        const mikro = MikroOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async (cfg: ConfigService) => {
                return ORMConfigurationOptions;
            }
        });
        

        const imports = [mikro, SebuConfigModule];
        const providers = [
            {
                provide: ADistributedLock,
                useClass: DistributedLock
            },
            ...storeProviders
        ];
        return {
            module: StorageModule,
            imports,
            providers,
            exports: providers,
            global: true
        }
    }

}
