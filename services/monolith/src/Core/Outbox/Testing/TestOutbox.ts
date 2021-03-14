import { Event } from '../../EventBus';
import { Outbox } from '../Outbox';

export class TestOutbox implements Outbox {
    public readonly sentEvents: Event[] = [];

    public send(event: Event): Promise<void> {
        this.sentEvents.push(event);

        return Promise.resolve();
    }
}
