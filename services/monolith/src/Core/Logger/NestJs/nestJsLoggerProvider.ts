import { PinoLogger } from '../PinoLogger';
import { pinoFactory } from '../pinoFactory';

export const LOGGER = 'LOGGER';
export const PINO_INSTANCE = 'PINO_INSTANCE';

export const nestJsLoggerProvider = [
    {
        provide: LOGGER,
        useFactory: (pinoInstance) => {
            return new PinoLogger(pinoInstance);
        },
        inject: [PINO_INSTANCE],
    },
    {
        provide: PINO_INSTANCE,
        useFactory: () => pinoFactory(),
    },
];
