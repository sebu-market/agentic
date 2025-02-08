import { MessageBus } from './impls';
import { AMessageBus } from './interfaces';

export * from './interfaces';
export * from './impls';

export const comProviders = [
    {
        provide: AMessageBus,
        useClass: MessageBus
    }
];