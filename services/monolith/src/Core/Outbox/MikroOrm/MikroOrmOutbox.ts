import { EntityManager } from '@mikro-orm/core';

import { Event } from '../../EventBus';
import { Outbox } from '../Outbox';

import { newOutboxMessageId, OutboxMessageEntity } from './OutboxMessageEntity';

export class MikroOrmOutbox implements Outbox {
    public constructor(
        private readonly em: EntityManager,
    ) {}

    public send(event: Event): Promise<void> {
        const message = new OutboxMessageEntity(
            newOutboxMessageId(),
            event.name,
            JSON.stringify(event),
        );

        this.em.persist(message);

        return Promise.resolve();
    }
}
