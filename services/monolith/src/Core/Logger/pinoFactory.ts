import * as Pino from 'pino';
import { err } from 'pino-std-serializers';

export const pinoFactory = (
    optionsOverrides?: Pino.LoggerOptions,
    stream?: Pino.DestinationStream,
): Pino.Logger => {
    const isProd = process.env.NODE_ENV === 'production';
    const options: Pino.LoggerOptions = {
        ...(!isProd && !stream ? { transport: { target: 'pino-pretty' } } : {}),
        serializers: {
            err,
            error: err,
        },
        ...optionsOverrides,
    };

    if (stream) {
        return Pino.pino(options, stream);
    }

    return Pino.pino(options);
};
