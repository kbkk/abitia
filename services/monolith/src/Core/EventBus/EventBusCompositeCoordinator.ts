import { Event } from './Event';
import { EventBus, EventBusSubscriber } from './EventBus';

export class EventBusCompositeCoordinator implements EventBus {
    private childEventBuses: EventBus[] = [];

    public registerChild(eventBus: EventBus): void {
        this.childEventBuses.push(eventBus);
    }

    public publish(event: Event): void {
        for(const childEventBus of this.childEventBuses) {
            childEventBus.publish(event);
        }
    }

    public subscribe<T extends typeof Event>(event: T, subscriber: EventBusSubscriber<T>): void {
        throw new Error('subscribe() is not supported by EventBusCompositeCoordinator');
    }
}
