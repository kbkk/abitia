import { EntityManager } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule, ModuleMetadata, Provider } from '@nestjs/common';

import { EVENT_BUS, EventBus } from '../../EventBus';
import { Logger, LOGGER } from '../../Logger';
import { MikroOrmOutbox } from '../MikroOrm/MikroOrmOutbox';
import { MikroOrmOutboxWorker } from '../MikroOrm/MikroOrmOutboxWorker';
import { OutboxMessageEntity } from '../MikroOrm/OutboxMessageEntity';

import { OUTBOX } from './constants';

const OUTBOX_MODULE_CONFIG = 'OUTBOX_MODULE_CONFIG';

type OutboxModuleConfig = {
    logger: Logger;
    eventBus: EventBus;
}

export interface OutboxModuleAsyncOptions
    extends Pick<ModuleMetadata, 'imports'> {
    useFactory: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
    ) => Promise<OutboxModuleConfig> | OutboxModuleConfig;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
}

export class OutboxModule {
    public static withMikroOrmAsync(options: OutboxModuleAsyncOptions): DynamicModule {
        return {
            module: OutboxModule,
            imports: [
                ...options.imports ?? [],
                MikroOrmModule.forFeature({
                    entities: [OutboxMessageEntity],
                }),
            ],
            providers: [
                this.createAsyncOptionsProvider(options),
                {
                    provide: MikroOrmOutboxWorker,
                    useFactory: (em: EntityManager, config: OutboxModuleConfig) => (
                        new MikroOrmOutboxWorker(em, config.eventBus, config.logger)
                    ),
                    inject: [EntityManager, OUTBOX_MODULE_CONFIG],
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

    private static createAsyncOptionsProvider(
        options: OutboxModuleAsyncOptions,
    ): Provider {
        return {
            provide: OUTBOX_MODULE_CONFIG,
            useFactory: options.useFactory,
            inject: options.inject ?? [],
        };
    }
}
