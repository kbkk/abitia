import { Logger as PinoInstance } from 'pino';

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
        if(obj) {
            this.pino[logType](obj, message);
        } else {
            this.pino[logType](message);
        }
    }
}
