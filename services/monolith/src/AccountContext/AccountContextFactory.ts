import { EntityManager, MikroORM } from '@mikro-orm/core';
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { BindingScopeEnum, Container } from 'inversify';

import { EVENT_BUS, EventBusCompositeCoordinator, nestJsInMemoryEventBusProvider } from '../Core/EventBus';
import { adapt } from '../Core/Inversify/InversifyNestJsAdapter';
import { LOGGER, nestJsLoggerProvider } from '../Core/Logger';
import { MikroOrmOutbox, MikroOrmOutboxWorker, OUTBOX, OutboxMessageEntity } from '../Core/Outbox';

import { AccountContextConfig } from './Configs/AccountContextConfig';
import { registerRoutes } from './Controllers/Routes';
import { SendAccountCreatedEmail } from './EventHandlers/SendAccountCreatedEmail';
import { ACCOUNT_REPOSITORY } from './Repositories/AccountRepository';
import { SqliteAccountRepository } from './Repositories/SqliteAccountRepository';
import { ConfirmAccountService } from './Services/ConfirmAccountService';
import { CreateAccountService } from './Services/CreateAccountService';
import { CreateAuthTokenService } from './Services/CreateAuthTokenService';
import { SuspendAccountService } from './Services/SuspendAccountService';


export interface AccountContextModuleOptions {
    mikroOrmOptions?: MikroOrmModuleSyncOptions;
    eventBusCoordinator?: EventBusCompositeCoordinator,
}

export class AccountContextFactory {
    public static async create({ mikroOrmOptions, eventBusCoordinator } : AccountContextModuleOptions, fastify: any): Promise<void> {
        const container = new Container({
            defaultScope: BindingScopeEnum.Singleton,
        });
        const outboxDebug = true;

        const orm = await MikroORM.init({
            entities: ['../../dist/AccountContext/Entities', OutboxMessageEntity],
            entitiesTs: ['../../src/AccountContext/Entities', OutboxMessageEntity],
            dbName: 'account-context.sqlite3',
            type: 'sqlite',
            baseDir: __dirname,
            ...mikroOrmOptions,
            tsNode: typeof jest !== 'undefined',
        });

        // TODO: add request scope middleware for MikroORM

        // Core
        adapt(container, nestJsLoggerProvider);
        adapt(container, nestJsInMemoryEventBusProvider);
        container.bind(AccountContextConfig).toDynamicValue(AccountContextConfig.fromEnv);

        // ORM
        container.bind(EntityManager).toConstantValue(orm.em);

        // Outbox
        container
            .bind(MikroOrmOutboxWorker)
            .toDynamicValue(
                ({ container }) => new MikroOrmOutboxWorker(
                    container.get(EntityManager),
                    container.get(EVENT_BUS),
                    container.get(LOGGER),
                    { debug: outboxDebug },
                ),
            );

        container
            .bind(OUTBOX)
            .toDynamicValue(
                ({ container }) => new MikroOrmOutbox(
                    container.get(EntityManager),
                    container.get(LOGGER),
                    { debug: outboxDebug },
                ),
            );

        // Event Handlers
        container.bind(SendAccountCreatedEmail).toSelf();

        // Services
        container.bind(ConfirmAccountService).toSelf();
        container.bind(CreateAccountService).toSelf();
        container.bind(CreateAuthTokenService).toSelf();
        container.bind(SuspendAccountService).toSelf();

        // Repositories
        container.bind(ACCOUNT_REPOSITORY).to(SqliteAccountRepository);

        // Start sequence
        // TODO: add shutdown sequence & refactor nicely
        await orm.getSchemaGenerator().ensureDatabase();
        await orm.getSchemaGenerator().updateSchema();
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        container.get(MikroOrmOutboxWorker).start();
        container.get(SendAccountCreatedEmail);

        registerRoutes(
            fastify,
            container,
        );
    }
}
