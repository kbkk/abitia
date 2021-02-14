import { Logger as NestLogger } from '@nestjs/common';

import { Logger } from './Logger';

export class NestJsLogger implements Logger {
    public debug(message: string, ...args: unknown[]): void {
        NestLogger.debug(message);
    }

    public error(message: string, ...args: unknown[]): void {
        NestLogger.log(message);
    }

    public log(message: string, ...args: unknown[]): void {
        NestLogger.log(message);
    }

    public warn(message: string, ...args: unknown[]): void {
        NestLogger.warn(message);
    }
}
