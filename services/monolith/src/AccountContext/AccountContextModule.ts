import { MikroOrmModule, MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { EVENT_BUS, EventBus, EventBusCompositeCoordinator, nestJsInMemoryEventBusProvider } from '../Core/EventBus';
import { LOGGER, Logger, NestJsLoggerAdapter, nestJsLoggerProvider } from '../Core/Logger';
import { intermediateModule } from '../Core/NestJs';
import { OpenTracingInterceptor } from '../Core/OpenTracing';
import { OutboxMessageEntity, OutboxModule, RegisterOutboxWorker } from '../Core/Outbox/';

import { AccountContextGateway } from './AccountContextGateway';
import { AccountContextConfig } from './Configs/AccountContextConfig';
import { AccountController } from './Controllers/AccountController';
import { AuthController } from './Controllers/AuthController';
import { SendAccountCreatedEmail } from './EventHandlers/SendAccountCreatedEmail';
import { ACCOUNT_REPOSITORY } from './Repositories/AccountRepository';
import { SqliteAccountRepository } from './Repositories/SqliteAccountRepository';
import { ConfirmAccountService } from './Services/ConfirmAccountService';
import { CreateAccountService } from './Services/CreateAccountService';
import { CreateAuthTokenService } from './Services/CreateAuthTokenService';

interface AccountContextModuleOptions {
    mikroOrmOptions?: MikroOrmModuleSyncOptions;
    eventBusCoordinator: EventBusCompositeCoordinator,
}

@Module({})
export class AccountContextModule {
    public static forRoot({ mikroOrmOptions, eventBusCoordinator } : AccountContextModuleOptions): DynamicModule {
        const loggerModule = intermediateModule(nestJsLoggerProvider);
        const eventBusModule = intermediateModule(nestJsInMemoryEventBusProvider, loggerModule);

        return {
            module: AccountContextModule,
            imports: [
                loggerModule,
                eventBusModule,
                OutboxModule.withMikroOrmAsync({
                    imports: [loggerModule,  eventBusModule],
                    useFactory: (eventBus: EventBus, logger: Logger) => ({
                        logger,
                        eventBus: eventBusCoordinator,
                    }),
                    inject: [EVENT_BUS, LOGGER],
                }),
                MikroOrmModule.forRoot({
                    entities: ['../../dist/AccountContext/Entities', OutboxMessageEntity],
                    entitiesTs: ['../../src/AccountContext/Entities', OutboxMessageEntity],
                    dbName: 'account-context.sqlite3',
                    type: 'sqlite',
                    baseDir: __dirname,
                    ...mikroOrmOptions,
                    tsNode: typeof jest !== 'undefined',
                }),
            ],
            controllers: [
                AccountController,
                AuthController,
            ],
            providers: [
                RegisterOutboxWorker,
                AccountContextGateway,
                CreateAuthTokenService,
                ConfirmAccountService,
                CreateAccountService,
                SendAccountCreatedEmail,
                {
                    provide: APP_INTERCEPTOR,
                    useClass: OpenTracingInterceptor,
                },
                {
                    provide: ACCOUNT_REPOSITORY,
                    useClass: SqliteAccountRepository,
                },
                {
                    provide: AccountContextConfig,
                    useFactory: AccountContextConfig.fromEnv,
                },
                NestJsLoggerAdapter,
            ],
            exports: [
                AccountContextGateway,
            ],
        };
    }
}
