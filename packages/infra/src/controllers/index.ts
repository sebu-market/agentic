import { authControllers } from './auth';
import { sessionControllers } from './sessions';
import { adminControllers } from './admin';

export * from './auth';
export * from './sessions';

export const allControllers = [
    ...adminControllers,
    ...authControllers,
    ...sessionControllers
]