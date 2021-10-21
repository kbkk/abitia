import { EntityManager, MikroORM } from '@mikro-orm/core';
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { FastifyInstance } from 'fastify';
import { AsyncContainerModule, BindingScopeEnum, Container } from 'inversify';

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
    public readonly container: Container;
    // eslint-disable-next-line @typescript-eslint/ban-types
    public readonly asyncModules: Map<object, AsyncContainerModule> = new Map();

    public constructor({ mikroOrmOptions, eventBusCoordinator } : AccountContextModuleOptions) {
        const container = new Container({
            defaultScope: BindingScopeEnum.Singleton,
        });
        const outboxDebug = true;

        // TODO: add request scope middleware for MikroORM

        // Core
        adapt(container, nestJsLoggerProvider);
        adapt(container, nestJsInMemoryEventBusProvider);
        container.bind(AccountContextConfig).toDynamicValue(AccountContextConfig.fromEnv);

        // ORM
        const ormModule = new AsyncContainerModule(async (bind) => {
            const orm = await MikroORM.init({
                entities: ['../../dist/AccountContext/Entities', OutboxMessageEntity],
                entitiesTs: ['../../src/AccountContext/Entities', OutboxMessageEntity],
                dbName: 'account-context.sqlite3',
                type: 'sqlite',
                baseDir: __dirname,
                ...mikroOrmOptions,
                tsNode: typeof jest !== 'undefined',
            });

            bind(MikroORM).toConstantValue(orm);
        });
        this.asyncModules.set(MikroORM, ormModule);
        container.bind(EntityManager).toDynamicValue((context => {
            const orm = context.container.get(MikroORM);
            return orm.em;
        })).inSingletonScope();

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

        this.container = container;
    }

    public async run(fastify: FastifyInstance): Promise<void> {
        await this.container.loadAsync(...this.asyncModules.values());
        const orm = this.container.get(MikroORM);
        // TODO: add shutdown sequence & refactor nicely
        await orm.getSchemaGenerator().ensureDatabase();
        await orm.getSchemaGenerator().updateSchema();
        this.container.get(SendAccountCreatedEmail);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.container.get(MikroOrmOutboxWorker).start();

        registerRoutes(
            fastify,
            this.container,
        );
    }
}
