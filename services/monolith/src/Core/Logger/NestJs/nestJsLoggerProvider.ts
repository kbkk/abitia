import { LOGGER } from '../Logger';
import { NestJsLogger } from '../NestJsLogger';

export const nestJsLoggerProvider = {
    provide: LOGGER,
    useClass: NestJsLogger,
};
