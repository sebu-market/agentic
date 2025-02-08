import {Module} from '@nestjs/common';
import {SebuConfigModule} from '@sebu/config';
import { allTools } from './tools';
import { allServices } from './services';

const providers = [
    ...allTools,
    ...allServices
]
@Module({
    imports: [
        SebuConfigModule
    ],
    providers,
    exports: providers
})
export class ToolsModule {}