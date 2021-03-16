import { AsyncLocalStorage } from 'async_hooks';

export const tracingStorage = new AsyncLocalStorage<{traceId: string}>();
