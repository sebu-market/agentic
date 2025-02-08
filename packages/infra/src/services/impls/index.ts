import { ACookieManager, AScreeningService } from '../interfaces';
import { APitchService } from '../interfaces/APitchService';
import { AgentForwardingService } from './AgentForwardingService';
import { CookieManager } from './CookieManager';
import { PitchService } from './PitchService';
import { PitchWatchdogService } from './PitchWatchdogService';
import { ScreeningService } from './ScreeningService';

export * from './CookieManager';
export * from './ScreeningService';
export * from './PitchService';
export * from './PitchWatchdogService';
export * from './AgentForwardingService';

export const serviceProviders = [
    PitchWatchdogService,
    AgentForwardingService,
    {
        provide: ACookieManager,
        useClass: CookieManager
    },
    {
        provide: AScreeningService,
        useClass: ScreeningService
    },
    {
        provide: APitchService,
        useClass: PitchService
    }
]