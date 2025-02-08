import { pitchControllers } from './pitch';
import { screeningControllers } from './screening';

export * from './screening';
export * from './pitch';

export const sessionControllers = [
    ...pitchControllers,
    ...screeningControllers
]