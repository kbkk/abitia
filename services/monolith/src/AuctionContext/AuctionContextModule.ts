import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule } from '@nestjs/common';

import { AuctionController } from './Controllers/AuctionController';
import { AUCTION_REPOSITORY } from './Repositories/AuctionRepository';
import { InMemoryAuctionRepository } from './Repositories/InMemoryAuctionRepository';
import { CreateAuctionService } from './Services/CreateAuctionService';

export class AuctionContextModule {
    public static forRoot(authModule: DynamicModule): DynamicModule {
        return {
            module: AuctionContextModule,
            imports: [
                authModule,
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
