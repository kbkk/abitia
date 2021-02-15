import { LOGGER } from '../Logger';
import { PinoLogger } from '../PinoLogger';

export const nestJsLoggerProvider = {
    provide: LOGGER,
    useClass: PinoLogger,
};
