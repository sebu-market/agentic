import { authControllers } from './auth';
import { sessionControllers } from './sessions';

export * from './auth';
export * from './sessions';

export const allControllers = [
    ...authControllers,
    ...sessionControllers
]