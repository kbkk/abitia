import { Inject, Injectable } from '@nestjs/common';

import { Auction, AuctionTypes, newAuctionId } from '../Entities/Auction';
import { AUCTION_REPOSITORY, AuctionRepository } from '../Repositories/AuctionRepository';

import { CreateAuctionCommand } from './Commands/CreateAuctionCommand';

@Injectable()
export class CreateAuctionService {
    public constructor(
        @Inject(AUCTION_REPOSITORY)
        private auctionRepository: AuctionRepository,
    ) {
    }

    public async execute(command: CreateAuctionCommand): Promise<Auction> {
        const auction = Auction.create(
            newAuctionId(),
            command.item,
            command.startingPrice,
            command.type as AuctionTypes,
            command.sellerId,
        );

        await this.auctionRepository.save(auction);

        return auction;
    }
}
