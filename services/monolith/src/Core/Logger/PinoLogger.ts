import * as pinoFactory from 'pino';

import { Logger } from './Logger';

// Todo: register pino itself in DI container
const pino = pinoFactory({ prettyPrint: true });

/**
 * Logger implementation based on pino.js
 */
export class PinoLogger implements Logger {
    public debug(message: string, obj?: Record<string, unknown>): void {
        this._doLog('debug', message, obj);
    }

    public error(message: string, obj?: Record<string, unknown>): void {
        this._doLog('error', message, obj);
    }

    public log(message: string, obj?: Record<string, unknown>): void {
        this._doLog('info', message, obj);
    }

    public warn(message: string, obj?: Record<string, unknown>): void {
        this._doLog('warn', message, obj);
    }

    private _doLog(logType: string, message: string, obj?: Record<string, unknown>): void {
        if(obj) {
            pino[logType](obj, message);
        } else {
            pino[logType](message);
        }
    }
}
