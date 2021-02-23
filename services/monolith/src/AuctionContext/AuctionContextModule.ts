import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { applyOrmMapping } from '../Core/OrmMappings';

import { AuctionController } from './Controllers/AuctionController';
import { AuctionMapping } from './Entities/OrmMappings/AuctionMapping';
import { AUCTION_REPOSITORY } from './Repositories/AuctionRepository';
import { InMemoryAuctionRepository } from './Repositories/InMemoryAuctionRepository';
import { CreateAuctionService } from './Services/CreateAuctionService';

applyOrmMapping(AuctionMapping);

@Module({
    imports: [
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
})
export class AuctionContextModule {
}
