import { Event } from './Event';
import { EventBus, EventBusSubscriber } from './EventBus';

export class InMemoryEventBus implements EventBus {
    private subscribers: Record<string, EventBusSubscriber<unknown>[]> = {};
    
    public publish(event: Event): void {
        // Run subscribers in a fire&forget manner
        this
            ._runPublish(event)
            .catch(error => console.error('Failed to run subscribers', error));
    }

    private async _runPublish(event: Event): Promise<void> {
        const eventSubscribers = this.subscribers[event.constructor.name] ?? [];

        for(const subscriber of eventSubscribers) {
            try {
                await subscriber(event);
            } catch (error) {
                // Todo: impl logger
                console.error(`Failed to run subscriber for event ${event.name}`, error);
            }
        }
    }

    public subscribe<T extends typeof Event>(event: T, subscriber: EventBusSubscriber<T>): void {
        if(!this.subscribers[event.name]) {
            this.subscribers[event.name] = [];
        }

        this.subscribers[event.name].push(subscriber);
    }
}
