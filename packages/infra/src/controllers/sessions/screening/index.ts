import { ScreeningController } from './ScreeningController';
import { ScreeningMessagesController } from './ScreeningMessagesController';

export * from './ScreeningController';
export * from './ScreeningMessagesController';

export const screeningControllers = [
    ScreeningController,
    ScreeningMessagesController
]