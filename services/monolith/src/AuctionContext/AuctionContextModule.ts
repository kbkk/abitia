import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { AccountContextGateway, AccountContextModule } from '../AccountContext';
import { AccountGuard } from '../Core/Auth';

import { AuctionController } from './Controllers/AuctionController';
import { AUCTION_REPOSITORY } from './Repositories/AuctionRepository';
import { InMemoryAuctionRepository } from './Repositories/InMemoryAuctionRepository';
import { CreateAuctionService } from './Services/CreateAuctionService';

@Module({
    imports: [
        AccountContextModule.forRoot(),
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
        AccountGuard,
        {
            provide: AUCTION_REPOSITORY,
            useClass: InMemoryAuctionRepository,
        },
    ],
})
export class AuctionContextModule {
}
