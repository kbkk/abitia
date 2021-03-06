import { Injectable } from '@nestjs/common';

import { Auction } from '../Entities/Auction';

import { AuctionRepository } from './AuctionRepository';

@Injectable()
export class InMemoryAuctionRepository implements AuctionRepository {
    private auctions: Auction[] = [];

    public save(newAuction: Auction): Promise<void> {
        const existingIndex = this.auctions.findIndex(account => account.id === newAuction.id);

        if (existingIndex !== -1) {
            this.auctions[existingIndex] = newAuction;
        } else {
            this.auctions.push(newAuction);
        }

        return Promise.resolve();
    }

    public findById(id: string): Promise<Auction | undefined> {
        const auction = this.auctions.find(auction => auction.id === id);

        return Promise.resolve(auction);
    }

    public findOpenByAccountId(accountId: string): Promise<Auction[]> {
        const auctions = this.auctions.filter(
            auction => auction.seller === accountId && auction.status === 'open',
        );

        return Promise.resolve(auctions);
    }

    public findLatest(amount = 10): Promise<Auction[]> {
        const auctions = this.auctions.slice(-5);

        return Promise.resolve(auctions);
    }
}
