export const LOGGER = 'LOGGER';

export interface Logger {
    error(message: string, ...args: unknown[]): void;
    log(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
}
