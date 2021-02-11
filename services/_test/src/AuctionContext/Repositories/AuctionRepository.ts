import {Auction} from "../Entities/Auction";

export interface AuctionRepository {
    save(newAccount: Auction): Promise<void>;

    findById(id: string): Promise<Auction | undefined>;
}

export const AUCTION_REPOSITORY = 'AuctionRepository';
