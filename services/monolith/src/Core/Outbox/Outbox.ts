import { Event } from '../EventBus';

export interface Outbox {
    send(event: Event): Promise<void>;
}
