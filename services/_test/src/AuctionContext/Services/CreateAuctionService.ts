import {Inject, Injectable} from "@nestjs/common";

import {CreateAuctionDto} from "../Dto/CreateAuctionDto";
import {Auction, newAuctionId} from "../Entities/Auction";
import {AUCTION_REPOSITORY, AuctionRepository} from "../Repositories/AuctionRepository";

@Injectable()
export class CreateAuctionService {
    public constructor(
        @Inject(AUCTION_REPOSITORY)
        private auctionRepository: AuctionRepository
    ) {
    }

    public async execute(dto: CreateAuctionDto): Promise<Auction> {
        const auction = Auction.create(
            newAuctionId(),
            dto.item,
            dto.price,
            dto.type,
            'sellerId'
        );

        await this.auctionRepository.save(auction);

        return auction;
    }
}
