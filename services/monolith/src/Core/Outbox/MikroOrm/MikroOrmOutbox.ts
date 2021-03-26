import { EntityManager } from '@mikro-orm/core';

import { Event } from '../../EventBus';
import { Logger } from '../../Logger';
import { getActiveSpan } from '../../OpenTracing';
import { Outbox } from '../Outbox';

import { newOutboxMessageId, OutboxMessageEntity } from './OutboxMessageEntity';

type MikroOrmOutboxOptions = {
    debug: boolean;
}

export class MikroOrmOutbox implements Outbox {
    private readonly options: MikroOrmOutboxOptions;

    public constructor(
        private readonly em: EntityManager,
        private readonly logger?: Logger,
        options: Partial<MikroOrmOutboxOptions> = {},
    ) {
        this.options = Object.assign({
            debug: false,
        }, options);
    }

    public send(event: Event): Promise<void> {
        /* istanbul ignore if  */
        if(this.options.debug) {
            this.logger?.info(`Persisting event ${event.name}`);
        }

        const tracingContext = getActiveSpan();
        const message = new OutboxMessageEntity(
            newOutboxMessageId(),
            event.name,
            JSON.stringify({ tracingContext, event }),
        );

        this.em.persist(message);

        return Promise.resolve();
    }
}
