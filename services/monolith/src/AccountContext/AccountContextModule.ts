import { MikroOrmModule, MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { DynamicModule, Module } from '@nestjs/common';

import { nestJsInMemoryEventBusProvider } from '../Core/EventBus';
import { NestJsLoggerAdapter, nestJsLoggerProvider } from '../Core/Logger';

import { AccountController } from './Controllers/AccountController';
import { SendAccountCreatedEmail } from './EventHandlers/SendAccountCreatedEmail';
import { ACCOUNT_REPOSITORY } from './Repositories/AccountRepository';
import { SqliteAccountRepository } from './Repositories/SqliteAccountRepository';
import { ConfirmAccountService } from './Services/ConfirmAccountService';
import { CreateAccountService } from './Services/CreateAccountService';

interface AccountContextModuleOptions {
    mikroOrmOptions?: MikroOrmModuleSyncOptions;
} 

@Module({})
export class AccountContextModule {
    public static forRoot({ mikroOrmOptions } : AccountContextModuleOptions = {}): DynamicModule {
        return {
            module: AccountContextModule,
            imports: [
                MikroOrmModule.forRoot({
                    entities: ['../../dist/AccountContext/Entities'],
                    entitiesTs: ['../../src/AccountContext/Entities'],
                    dbName: 'account-context.sqlite3',
                    type: 'sqlite',
                    baseDir: __dirname,
                    ...mikroOrmOptions
                }),
            ],
            controllers: [
                AccountController,
            ],
            providers: [
                ConfirmAccountService,
                CreateAccountService,
                SendAccountCreatedEmail,
                {
                    provide: ACCOUNT_REPOSITORY,
                    useClass: SqliteAccountRepository
                },
                ...nestJsLoggerProvider,
                nestJsInMemoryEventBusProvider,
                NestJsLoggerAdapter
            ]
        };
    }
}
