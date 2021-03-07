import { EntityManager } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule } from '@nestjs/common';

import { MikroOrmOutbox } from '../MikroOrm/MikroOrmOutbox';
import { MikroOrmOutboxWorker } from '../MikroOrm/MikroOrmOutboxWorker';
import { OutboxMessageEntity } from '../MikroOrm/OutboxMessageEntity';

import { OUTBOX } from './constants';

export class OutboxModule {
    public static withMikroOrm(): DynamicModule {
        return {
            module: OutboxModule,
            imports: [
                MikroOrmModule.forFeature({
                    entities: [OutboxMessageEntity],
                }),
            ],
            providers: [
                {
                    provide: MikroOrmOutboxWorker,
                    useFactory: (em: EntityManager) => (
                        new MikroOrmOutboxWorker(em)
                    ),
                    inject: [EntityManager],
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
