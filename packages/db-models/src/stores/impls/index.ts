import { AUserStore } from '../interfaces';
import { DataStoreFactory } from './DataStoreFactory';
import { UserStore } from './UserStore';
import { ADataStoreFactory } from '../interfaces';


export * from './DataStoreFactory';
export * from './UserStore';
export * from './ScreeningStore';
export * from './PitchStore';
export * from './TokenMetaStore';

export const storeProviders = [
    {
        provide: ADataStoreFactory,
        useClass: DataStoreFactory
    },
    {
        provide: AUserStore,
        useClass: UserStore
    }
]