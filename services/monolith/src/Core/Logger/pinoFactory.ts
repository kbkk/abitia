import * as pino from 'pino';
import { err } from 'pino-std-serializers';

export const pinoFactory = (
    optionsOverrides?: pino.LoggerOptions,
    stream?: pino.DestinationStream,
): pino.Logger => {
    const isProd = process.env.NODE_ENV === 'production';
    return pino(
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
