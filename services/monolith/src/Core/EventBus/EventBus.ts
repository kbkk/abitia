import { Event } from './Event';

export const EVENT_BUS = 'EVENT_BUS';

export type EventBusSubscriber<T> = (event: T) => void|Promise<void>;

export interface EventBus {
    publish(event: Event): void;

    subscribe<T extends typeof Event>(event: T, subscriber: EventBusSubscriber<T>): void;
}
