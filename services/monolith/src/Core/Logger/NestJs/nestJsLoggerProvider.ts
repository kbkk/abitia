import * as pinoFactory from 'pino';
import { err } from 'pino-std-serializers';

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
            const pino = pinoFactory({
                ...isProd ? {} : { prettyPrint: true },
                serializers: {
                    // only keys named 'err' and 'error' will be passed to the error serializer
                    err,
                    error: err,
                },
            });

            return pino;
        },
    },
];
