import { MikroORM } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

import { TestLogger } from '../../../Core/Testing';
import { Auction, newAuctionId } from '../../Entities/Auction';
import { AuctionRepository } from '../../Repositories/AuctionRepository';
import { InMemoryAuctionRepository } from '../../Repositories/InMemoryAuctionRepository';
import { PlaceAuctionBidService } from '../PlaceAuctionBidService';

const createAuction = (): Auction => Auction.create(
    newAuctionId(),
    'testItem',
    1000,
    'buy-it-now',
    'testSeller',
);

describe('PlaceAuctionBidService', () => {
    let auctionRepository: AuctionRepository;
    let service: PlaceAuctionBidService;

    beforeAll(async () => {
        // todo: Move to test utils
        const orm = await MikroORM.init({
            tsNode: true,
            baseDir: __dirname,
            entities: ['../../Entities/*.js'],
            entitiesTs: ['../../Entities/*.ts'],
            type: 'sqlite',
            dbName: ':memory:',
        });

        // We just want to initialize entity metadata, close the ORM immediately to allow clean shutdown
        await orm.close(true);
    });

    beforeEach(async () => {
        auctionRepository = new InMemoryAuctionRepository();
        service = new PlaceAuctionBidService(auctionRepository, new TestLogger());
    });

    it('should fail if auction does not exist',async () => {
        const auctionId = newAuctionId();
        const buyerId = uuid();

        const result = await service.execute({
            price: 1000,
            auctionId,
            buyerId,
        });

        expect(result).toEqual({
            success: false,
            message: 'Cannot find auction',
        });
    });

    it('should place bid',async () => {
        const auction = createAuction();
        const buyerId = uuid();
        await auctionRepository.save(auction);

        const result = await service.execute({
            price: 1000,
            auctionId: auction.id,
            buyerId,
        });

        const updatedAuction = await auctionRepository.findById(auction.id);

        expect(updatedAuction?.bids?.[0]).toMatchObject({
            price: 1000,
        });
        expect(result).toEqual({
            success: true,
        });
    });

    it('should fail if trying to place a bid lower than highest one',async () => {
        const auction = createAuction();
        const buyerId = uuid();
        await auctionRepository.save(auction);

        await service.execute({
            price: 1000,
            auctionId: auction.id,
            buyerId,
        });

        const promise = service.execute({
            price: 999,
            auctionId: auction.id,
            buyerId,
        });

        await expect(promise).resolves.toEqual({
            success: false,
            message: 'The placed bid should be higher than highest bid (1000)',
        });
    });
});
