import { v4 as uuid } from 'uuid';

import { AccountSuspendedEvent } from '../../../AccountContext/Events';
import { EventBus } from '../../../Core/EventBus';
import { InMemoryEventBus } from '../../../Core/EventBus/InMemoryEventBus';
import { TestLogger, waitMs } from '../../../Core/Testing';
import { Auction, newAuctionId } from '../../Entities/Auction';
import { AuctionRepository } from '../../Repositories/AuctionRepository';
import { InMemoryAuctionRepository } from '../../Repositories/InMemoryAuctionRepository';
import { AccountSuspendedEventHandler } from '../AccountSuspendedEventHandler';

const createAuction = (opts: {seller: string, cancelled?: boolean}): Auction => {
    const auction = Auction.create(
        newAuctionId(),
        'testItem',
        1000,
        'buy-it-now',
        opts.seller,
    );

    if (opts?.cancelled){
        auction.cancel();
    }

    return auction;
};

describe('AccountSuspendedEventHandler', () => {
    let handler: AccountSuspendedEventHandler;
    let eventBus: EventBus;
    let auctionRepository: AuctionRepository;

    beforeAll(() => {
        eventBus = new InMemoryEventBus();
        auctionRepository = new InMemoryAuctionRepository();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handler = new AccountSuspendedEventHandler(
            eventBus,
            auctionRepository,
            new TestLogger(),
        );
    });

    it('should cancel all seller\'s auctions on AccountSuspendedEvent', async () => {
        const accountId = uuid();
        const event = new AccountSuspendedEvent(accountId as never);
        const auction1 = createAuction({ seller: accountId, cancelled: false });
        const auction2 = createAuction({ seller: accountId, cancelled: false });
        const auction3 = createAuction({ seller: accountId, cancelled: true });
        await auctionRepository.save(auction1);
        await auctionRepository.save(auction2);
        await auctionRepository.save(auction3);
        const saveSpy = jest.spyOn(auctionRepository, 'save');

        eventBus.publish(event);

        await waitMs(50);

        expect(saveSpy).toHaveBeenCalledTimes(2);
        expect(saveSpy).toHaveBeenCalledWith(auction1);
        expect(saveSpy).toHaveBeenCalledWith(auction2);
    });
});
