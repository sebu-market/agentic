import {
    ChildLoggerOptions,
    default as pino
} from 'pino';

const rootLogger = pino({
    level: 'info',
});

export type Logger = pino.Logger;

export type LoggerFactoryGetInstanceBindings = pino.Bindings & {
    name: string;
}

export class LoggerFactory {
    static getInstance(
        bindings: LoggerFactoryGetInstanceBindings, 
        options?: ChildLoggerOptions
    ): Logger {
        return rootLogger.child(bindings, options);
    }
}