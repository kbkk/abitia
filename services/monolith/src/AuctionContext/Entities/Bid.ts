import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

import type { Auction } from './Auction';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type BidId = string & { __brand: 'BidId' }

export type AuctionTypes = 'buy-it-now' | 'auction';

@Entity()
export class Bid {
    @PrimaryKey({ type: 'string' })
    public readonly id: BidId;

    @Property({ type: 'number' })
    public readonly price: number;

    @Property({ type: 'Date' })
    public readonly createdAt: Date;

    @ManyToOne('Auction')
    public readonly auction: Auction;

    private constructor(
        id: BidId,
        price: number,
        createdAt: Date,
    ) {
        this.id = id;
        this.price = price;
        this.createdAt = createdAt;
    }

    public static create(
        id: BidId,
        price: number,
    ): Bid {
        return new Bid(
            id,
            price,
            new Date(),
        );
    }
}

export const newBidId = (): BidId => {
    return uuid() as BidId;
};
