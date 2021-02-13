import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { AuctionController } from './Controllers/AuctionController';
import { AUCTION_REPOSITORY } from './Repositories/AuctionRepository';
import { InMemoryAuctionRepository } from './Repositories/InMemoryAuctionRepository';
import { CreateAuctionService } from './Services/CreateAuctionService';

@Module({
    imports: [
        MikroOrmModule.forRoot({
            entities: ['../../dist/AuctionContext/Entities/*.js'],
            entitiesTs: ['../../src/AuctionContext/Entities/*.ts'],
            dbName: 'my-db-name.sqlite3',
            type: 'sqlite',
            baseDir: __dirname,
        }),
    ],
    controllers: [
        AuctionController,
    ],
    providers: [
        CreateAuctionService,
        {
            provide: AUCTION_REPOSITORY,
            useClass: InMemoryAuctionRepository
        }
    ]
})
export class AuctionContextModule {
}
