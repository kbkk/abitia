import { EntityManager } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule } from '@nestjs/common';

import { EVENT_BUS, EventBus } from '../../EventBus';
import { Logger, LOGGER } from '../../Logger';
import { MikroOrmOutbox } from '../MikroOrm/MikroOrmOutbox';
import { MikroOrmOutboxWorker } from '../MikroOrm/MikroOrmOutboxWorker';
import { OutboxMessageEntity } from '../MikroOrm/OutboxMessageEntity';

import { OUTBOX } from './constants';

export class OutboxModule {
    public static withMikroOrmAsync(imports: DynamicModule[]): DynamicModule {
        return {
            module: OutboxModule,
            imports: [
                ...imports,
                MikroOrmModule.forFeature({
                    entities: [OutboxMessageEntity],
                }),
            ],
            providers: [
                {
                    provide: MikroOrmOutboxWorker,
                    useFactory: (em: EntityManager, eventBus: EventBus, logger: Logger) => (
                        new MikroOrmOutboxWorker(em, eventBus, logger)
                    ),
                    inject: [EntityManager, EVENT_BUS, LOGGER],
                },
                {
                    provide: OUTBOX,
                    useFactory: (em: EntityManager) => (
                        new MikroOrmOutbox(em)
                    ),
                    inject: [EntityManager],
                },
            ],
            exports: [
                MikroOrmOutboxWorker,
                OUTBOX,
            ],
        };
    }
}
