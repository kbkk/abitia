import { Collection, MikroORM } from '@mikro-orm/core';

import { Auction, newAuctionId } from '../Auction';
import { Bid, newBidId } from '../Bid';

const createBid = (price: number): Bid => Bid.create(newBidId(),  price);

describe('Auction', () => {
    let auction: Auction;

    beforeAll(async () => {
        const orm = await MikroORM.init({
            tsNode: true,
            baseDir: __dirname,
            entities: ['../*.js'],
            entitiesTs: ['../*.ts'],
            type: 'sqlite',
            dbName: ':memory:',
        });

        // We just want to initialize entity metadata, close the ORM immediately to allow clean shutdown
        await orm.close(true);
    });

    beforeEach(() => {
        auction = Auction.create(
            newAuctionId(),
            'testItem',
            1000,
            'buy-it-now',
            'testSeller',
        );
    });

    it('should create a new Auction aggregate', () => {
        expect(auction).toEqual({
            createdAt: expect.any(Date),
            id: expect.any(String),
            item: 'testItem',
            startingPrice: 1000,
            seller: 'testSeller',
            type: 'buy-it-now',
            bids: expect.any(Collection),
        });
    });

    describe('placeBid()', () => {
        it('should be able to place first bid', () => {
            const bid = createBid(1000);
            auction.placeBid(bid);

            expect(
                auction.bids.getItems(),
            ).toEqual(
                [bid],
            );
        });

        it('should be able to place consecutive bids', () => {
            auction.placeBid(createBid(1000));

            auction.placeBid(createBid(1001));

            auction.placeBid(createBid(1002));

            expect(auction.bids).toHaveLength(3);
        });

        it('should not be able to place a bid below the highest bid', () => {
            auction.placeBid(createBid(1000));

            const run = (): void => auction.placeBid(createBid(900));

            expect(run).toThrow('The placed bid should be higher than highest bid (1000)');
        });

        it('should not be able to place a bid below the starting price', () => {
            const run = (): void => auction.placeBid(createBid(999));

            expect(run).toThrow('The placed bid should be higher than auction starting price (1000)');
        });
    });
});
