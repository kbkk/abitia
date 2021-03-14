import { EntityManager } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule, ModuleMetadata, Provider } from '@nestjs/common';

import { EventBus } from '../../EventBus';
import { Logger } from '../../Logger';
import { MikroOrmOutbox, MikroOrmOutboxWorker, OutboxMessageEntity } from '../MikroOrm';

import { OUTBOX } from './constants';

const OUTBOX_MODULE_CONFIG = 'OUTBOX_MODULE_CONFIG';

type OutboxModuleConfig = {
    debug?: boolean;
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
                    useFactory: (em: EntityManager, { eventBus, logger, debug }: OutboxModuleConfig) => (
                        new MikroOrmOutboxWorker(em, eventBus, logger, { debug })
                    ),
                    inject: [EntityManager, OUTBOX_MODULE_CONFIG],
                },
                {
                    provide: OUTBOX,
                    useFactory: (em: EntityManager, { logger, debug }: OutboxModuleConfig) => (
                        new MikroOrmOutbox(em, logger, { debug })
                    ),
                    inject: [EntityManager, OUTBOX_MODULE_CONFIG],
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
