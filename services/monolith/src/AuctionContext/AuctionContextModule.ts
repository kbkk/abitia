import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule } from '@nestjs/common';

import { AccountAuthModule } from '../Core/Auth';

import { AuctionContextConfig } from './Configs/AuctionContextConfig';
import { AuctionController } from './Controllers/AuctionController';
import { AUCTION_REPOSITORY } from './Repositories/AuctionRepository';
import { InMemoryAuctionRepository } from './Repositories/InMemoryAuctionRepository';
import { CreateAuctionService } from './Services/CreateAuctionService';

export class AuctionContextConfigModule {
    public static forRoot(factory?: () => AuctionContextConfig): DynamicModule {
        return {
            module: AuctionContextConfigModule,
            global: true,
            providers: [
                {
                    provide: AuctionContextConfig,
                    useFactory: factory ?? AuctionContextConfig.fromEnv,
                },
            ],
            exports: [
                AuctionContextConfig,
            ],
        };
    }
}

type AuctionContextModuleOptions = {
    configFactory?: () => AuctionContextConfig
}

export class AuctionContextModule {
    public static forRoot(options?: AuctionContextModuleOptions): DynamicModule {
        const configModule = AuctionContextConfigModule.forRoot(options?.configFactory);

        return {
            module: AuctionContextModule,
            imports: [
                AccountAuthModule.registerAsync({
                    imports: [configModule],
                    useFactory: (config: AuctionContextConfig) => ({
                        jwtSecret: config.jwtSecretKey,
                    }),
                    inject: [AuctionContextConfig],
                }),
                MikroOrmModule.forRoot({
                    entities: ['../../dist/AuctionContext/Entities/*.js'],
                    entitiesTs: ['../../src/AuctionContext/Entities/*.ts'],
                    dbName: 'auction-context.sqlite3',
                    type: 'sqlite',
                    baseDir: __dirname,
                    tsNode: typeof jest !== 'undefined',
                }),
            ],
            controllers: [
                AuctionController,
            ],
            providers: [
                CreateAuctionService,
                {
                    provide: AUCTION_REPOSITORY,
                    useClass: InMemoryAuctionRepository,
                },
            ],
        };
    }
}
