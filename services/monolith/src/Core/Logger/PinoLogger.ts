import { Logger as PinoInstance } from 'pino';

import { getActiveSpan } from '../OpenTracing';

import { Logger } from './Logger';

/**
 * Logger implementation based on pino.js
 */
export class PinoLogger implements Logger {
    public constructor(
        private readonly pino: PinoInstance,
    ) {
    }

    public debug(message: string, obj?: Record<string, unknown>): void {
        this._doLog('debug', message, obj);
    }

    public error(message: string, obj?: Record<string, unknown>): void {
        this._doLog('error', message, obj);
    }

    public info(message: string, obj?: Record<string, unknown>): void {
        this._doLog('info', message, obj);
    }

    public warn(message: string, obj?: Record<string, unknown>): void {
        this._doLog('warn', message, obj);
    }

    private _doLog(logType: string, message: string, obj?: Record<string, unknown>): void {
        const spanContext = getActiveSpan();

        const logObj = {
            traceId: spanContext?.traceId,
            spanId: spanContext?.spanId,
            traceFlags: spanContext?.traceFlags,
            ...obj,
        };

        this.pino[logType](logObj, message);
    }
}
