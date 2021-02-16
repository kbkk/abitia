export interface Logger {
    error(message: string, obj?: Record<string, unknown>): void;
    info(message: string, obj?: Record<string, unknown>): void;
    warn(message: string, obj?: Record<string, unknown>): void;
    debug(message: string, obj?: Record<string, unknown>): void;
}
