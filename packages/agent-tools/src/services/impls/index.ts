import { AToolRepo } from '../interfaces/AToolRepo';
import { ToolRepo } from './ToolRepo';

export * from './ToolRepo';

export const allServices = [
    {
        provide: AToolRepo,
        useClass: ToolRepo
    }
];