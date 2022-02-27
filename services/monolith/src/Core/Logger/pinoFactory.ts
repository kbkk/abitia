import * as Pino from 'pino';
import { err } from 'pino-std-serializers';

export const pinoFactory = (
    optionsOverrides?: Pino.LoggerOptions,
    stream?: Pino.DestinationStream,
): Pino.Logger => {
    const isProd = process.env.NODE_ENV === 'production';
    return Pino.pino(
        {
            ...isProd ? {} : { prettyPrint: true },
            serializers: {
            // only keys named 'err' and 'error' will be passed to the error serializer
                err,
                error: err,
            },
            ...optionsOverrides,
        },
        stream!,
    );
};
