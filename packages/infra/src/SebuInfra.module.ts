import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AgentModule } from '@sebu/agents';
import { CommunicationsModule } from '@sebu/communication';
import { StorageModule } from '@sebu/db-models';
import { serviceProviders } from './services';
import { txnHandlers } from './txns';
import { allControllers } from './controllers';
import { SQSModule } from '@sebu/sqs-service';
import { SSMModule } from '@sebu/ssm-service';

const providers = [
  ...serviceProviders,
  ...txnHandlers,
];

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    StorageModule.registerAsync(),
    SQSModule.forRoot(),
    SSMModule,
    AgentModule,
    CommunicationsModule,
  ],
  controllers: [
    ...allControllers
  ],
  providers,
  exports: providers
})
export class SebuInfraModule { }
