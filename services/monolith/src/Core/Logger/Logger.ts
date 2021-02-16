export interface Logger {
    error(message: string, obj?: Record<string, unknown>): void;
    log(message: string, obj?: Record<string, unknown>): void;
    warn(message: string, obj?: Record<string, unknown>): void;
    debug(message: string, obj?: Record<string, unknown>): void;
}
