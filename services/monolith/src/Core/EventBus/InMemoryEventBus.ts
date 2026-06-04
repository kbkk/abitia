import { Logger } from '../Logger';

import { Event } from './Event';
import { EventBus, EventBusSubscriber } from './EventBus';

export class InMemoryEventBus implements EventBus {
    private subscribers: Record<string, EventBusSubscriber<unknown>[]> = {};

    public constructor(
        private readonly logger?: Logger,
    ) {
    }

    public publish(event: Event): void {
        // Run subscribers in a fire&forget manner
        this
            ._runPublish(event)
            .catch(error => this.logger?.error('Failed to run subscribers', error as Record<string, unknown>));
    }

    private async _runPublish(event: Event): Promise<void> {
        const eventSubscribers = this.subscribers[event.constructor.name] ?? [];

        for(const subscriber of eventSubscribers) {
            try {
                await subscriber(event);
            } catch (error) {
                this.logger?.error(`Failed to run subscriber for event ${event.name}`, error as Record<string, unknown>);
            }
        }
    }

    public subscribe<T extends typeof Event>(event: T, subscriber: EventBusSubscriber<InstanceType<T>>): void {
        if(!this.subscribers[event.name]) {
            this.subscribers[event.name] = [];
        }

        this.subscribers[event.name].push(subscriber as EventBusSubscriber<unknown>);
    }
}
