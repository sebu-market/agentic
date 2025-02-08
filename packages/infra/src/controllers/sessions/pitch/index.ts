import { PitchController } from './PitchController';
import { PitchMessagesController } from './PitchMessagesController';

export * from './PitchController';
export * from './PitchMessagesController';

export const pitchControllers = [
    PitchController,
    PitchMessagesController
]