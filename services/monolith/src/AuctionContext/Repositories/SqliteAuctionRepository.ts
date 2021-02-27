import { EntityManager, LockMode } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import { Auction } from '../Entities/Auction';

import { AuctionRepository } from './AuctionRepository';

@Injectable()
export class SqliteAuctionRepository implements AuctionRepository {
    public constructor(
        private readonly em: EntityManager,
    ) {
    }

    public async save(auction: Auction): Promise<void> {
        // todo: hack hack, force ORM to mark entity as dirty
        auction.version2++;
        await this.em.persist(auction);
        await this.em.flush();
    }

    public async findById(id: string): Promise<Auction | undefined> {
        const auction = await this.em.findOne(Auction, { id }, ['bids']) ?? undefined;

        return auction;
    }
}
