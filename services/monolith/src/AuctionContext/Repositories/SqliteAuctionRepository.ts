import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import {Auction, AuctionId} from '../Entities/Auction';

import { AuctionRepository } from './AuctionRepository';

@Injectable()
export class SqliteAuctionRepository implements AuctionRepository {
    public constructor(
        private readonly em: EntityManager,
    ) {
    }

    public async save(auction: Auction): Promise<void> {
        auction.incrementVersion();
        await this.em.persist(auction);
        await this.em.flush();
    }

    public async findById(id: string): Promise<Auction | undefined> {
        const auction = await this.em.findOne(Auction, { id: id as AuctionId }, { populate: ['bids'] }) ?? undefined;

        return auction;
    }

    public async findOpenByAccountId(accountId: string): Promise<Auction[]> {
        const auctions = await this.em.find(
            Auction,
            { seller: accountId, status: 'open' },
            { populate: ['bids'] },
        );

        return auctions;
    }
}
