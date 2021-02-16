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

    public verbose(message: string, context?: string): void {
        this.logger.debug(this._formatMessage(message, context));
    }

    public debug(message: string, context?: string): void {
        this.logger.debug(this._formatMessage(message, context));
    }

    public log(message: string, context?: string): void {
        this.logger.info(this._formatMessage(message, context));
    }

    public warn(message: string, context?: string): void {
        this.logger.warn(this._formatMessage(message, context));
    }

    public error(message: string, trace?: string, context?: string): void {
        this.logger.error(this._formatMessage(message, context), { trace });
    }

    private _formatMessage(message: string, context?: string): string {
        const prefix = context ? `[${context}] ` : '';
        return prefix + message;
    }
}
