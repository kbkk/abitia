import * as pinoFactory from 'pino';

import { PinoLogger } from '../PinoLogger';

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
        useFactory: () => {
            const isProd = process.env.NODE_ENV === 'production';
            const pino = pinoFactory(isProd ? {} : { prettyPrint: true });

            return pino;
        },
    }
];
