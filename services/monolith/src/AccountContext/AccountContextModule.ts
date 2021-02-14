import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

import { EVENT_BUS } from '../Core/EventBus';
import { InMemoryEventBus } from '../Core/EventBus/InMemoryEventBus';

import { AccountController } from './Controllers/AccountController';
import { AccountCreatedEventHandler } from './EventHandlers/AccountCreatedEventHandler';
import { ACCOUNT_REPOSITORY } from './Repositories/AccountRepository';
import { SqliteAccountRepository } from './Repositories/SqliteAccountRepository';
import { CreateAccountService } from './Services/CreateAccountService';

@Module({
    imports: [
        MikroOrmModule.forRoot({
            entities: ['../../dist/AccountContext/Entities'],
            entitiesTs: ['../../src/AccountContext/Entities'],
            dbName: 'my-db-name.sqlite3',
            type: 'sqlite',
            baseDir: __dirname,
        }),
    ],
    controllers: [
        AccountController,
    ],
    providers: [
        CreateAccountService,
        AccountCreatedEventHandler,
        {
            provide: ACCOUNT_REPOSITORY,
            useClass: SqliteAccountRepository
        },
        {
            provide: EVENT_BUS,
            useClass: InMemoryEventBus
        },
    ]
})
export class AccountContextModule {
}
