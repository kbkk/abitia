import { Inject, Injectable } from '@nestjs/common';

import { Logger, LOGGER } from '../../Core/Logger';
import { Bid, newBidId } from '../Entities/Bid';
import { AUCTION_REPOSITORY, AuctionRepository } from '../Repositories/AuctionRepository';

import { PlaceAuctionBidCommand } from './Commands/PlaceAuctionBidCommand';

export type PlaceAuctionBid = {
    success: true;
} | {
    success: false;
    message: string;
}

@Injectable()
export class PlaceAuctionBidService {
    public constructor(
        @Inject(AUCTION_REPOSITORY)
        private auctionRepository: AuctionRepository,
        @Inject(LOGGER)
        private logger: Logger,
    ) {
    }

    public async execute(command: PlaceAuctionBidCommand): Promise<PlaceAuctionBid> {
        const auction = await this.auctionRepository.findById(command.auctionId);

        if(!auction) {
            return {
                success: false,
                message: 'Cannot find auction',
            };
        }

        const bid = Bid.create(newBidId(), command.price);

        try {
            auction.placeBid(bid);
        } catch (error) {
            const { message } = error as Error;

            this.logger.debug(`Failed to place bid (${bid.price}): ${message}`);
            return { success: false, message };
        }

        await this.auctionRepository.save(auction);

        return { success: true };
    }
}
