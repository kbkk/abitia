import {MikroOrmModule} from "@mikro-orm/nestjs";
import {Module} from "@nestjs/common";

import {AccountController} from "./Controllers/AccountController";
import {ACCOUNT_REPOSITORY} from "./Repositories/AccountRepository";
import {SqliteAccountRepository} from "./Repositories/SqliteAccountRepository";
import {CreateAccountService} from "./Services/CreateAccountService";

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
        {
            provide: ACCOUNT_REPOSITORY,
            useClass: SqliteAccountRepository
        }
    ]
})
export class AccountContextModule {
}
