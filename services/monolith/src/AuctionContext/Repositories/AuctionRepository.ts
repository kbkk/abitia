import { Auction } from '../Entities/Auction';

export interface AuctionRepository {
    save(newAccount: Auction): Promise<void>;

    findById(id: string): Promise<Auction | undefined>;

    findOpenByAccountId(accountId: string): Promise<Auction[]>;
}

export const AUCTION_REPOSITORY = 'AuctionRepository';
