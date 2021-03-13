import { Inject, Injectable } from '@nestjs/common';

import { AccountSuspendedEvent } from '../../AccountContext/Events';
import { EVENT_BUS, EventBus } from '../../Core/EventBus';
import { Logger, LOGGER } from '../../Core/Logger';
import { AUCTION_REPOSITORY, AuctionRepository } from '../Repositories/AuctionRepository';

@Injectable()
export class AccountSuspendedEventHandler {
    public constructor(
        @Inject(EVENT_BUS)
        private readonly eventBus: EventBus,
        @Inject(AUCTION_REPOSITORY)
        private readonly auctionRepository: AuctionRepository,
        @Inject(LOGGER)
        private readonly logger: Logger,
    ) {
        this.eventBus.subscribe(AccountSuspendedEvent, this.handle.bind(this));
    }

    private async handle(event: AccountSuspendedEvent): Promise<void> {
        const { accountId } = event;
        const auctions = await this.auctionRepository.findOpenByAccountId(accountId);

        this.logger.info(`Cancelling ${auctions.length} auctions for account ${accountId}`);

        for (const auction of auctions) {
            auction.cancel();
            await this.auctionRepository.save(auction);
        }
    }
}
