import { Inject, Injectable, LoggerService } from '@nestjs/common';

import { Logger } from '../Logger';

import { LOGGER } from './nestJsLoggerProvider';

@Injectable()
export class NestJsLoggerAdapter implements LoggerService {
    public constructor(
        @Inject(LOGGER)
        private readonly logger: Logger,
    ) {
    }

    public verbose(message: string, context?: string, ...args: unknown[]): void {
        this.logger.debug(message, { args });
    }

    public debug(message: string, context?: string, ...args: unknown[]): void {
        this.logger.debug(message, { args });
    }

    public log(message: string, context?: string, ...args: unknown[]): void {
        this.logger.log(message, { args });
    }

    public warn(message: string, context?: string, ...args: unknown[]): void {
        this.logger.warn(message, { args });
    }

    public error(message: string, trace?: string, context?: string, ...args: unknown[]): void {
        this.logger.error(message, { trace, context, args });
    }
}
