import { Collection, Entity, LoadStrategy, OneToMany, PrimaryKey, Property, QueryOrder } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

import { Bid } from './Bid';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type AuctionId = string & { __brand: 'AuctionId' }

export type AuctionTypes = 'buy-it-now' | 'auction';
export type AuctionStatus = 'open' | 'ended' | 'cancelled';

class PlaceBidError extends Error {}

@Entity()
export class Auction {
    @PrimaryKey({ type: 'string' })
    public readonly id: AuctionId;

    @Property({ type: 'string' })
    public readonly item: string;

    @Property({ type: 'number' })
    public readonly startingPrice: number;

    @Property({ type: 'string' })
    public readonly type: AuctionTypes;

    @Property({ type: 'string' })
    public readonly seller: string;

    @OneToMany({
        entity: () => Bid,
        mappedBy: 'auction',
        orphanRemoval: true,
        strategy: LoadStrategy.JOINED,
        orderBy: { createdAt: QueryOrder.DESC },
    })
    public readonly bids = new Collection<Bid>(this);

    @Property({ type: 'string' })
    public readonly status: AuctionStatus = 'open';

    @Property({ type: 'Date' })
    public readonly createdAt: Date;

    @Property({ type: 'Date' })
    public readonly updatedAt: Date;

    @Property({ version: true })
    public readonly version: number;

    private constructor(
        id: AuctionId,
        item: string,
        startingPrice: number,
        type: AuctionTypes,
        seller: string,
        createdAt: Date,
    ) {
        this.id = id;
        this.item = item;
        this.startingPrice = startingPrice;
        this.type = type;
        this.seller = seller;
        this.createdAt = createdAt;
    }

    public static create(
        id: AuctionId,
        item: string,
        startingPrice: number,
        type: AuctionTypes,
        seller: string,
    ): Auction {
        return new Auction(
            id,
            item,
            startingPrice,
            type,
            seller,
            new Date(),
        );
    }

    public placeBid(newBid: Bid): void {
        if(this.status !== 'open') {
            throw new PlaceBidError(
                'Cannot place a bid, the auction has ended',
            );
        }

        const bids = this.bids.getItems();
        const [highestBid] = bids;

        if(highestBid && highestBid.price >= newBid.price) {
            throw new PlaceBidError(
                `The placed bid should be higher than highest bid (${highestBid.price})`,
            );
        }

        if(this.startingPrice > newBid.price) {
            throw new PlaceBidError(
                `The placed bid should be higher than auction starting price (${this.startingPrice})`,
            );
        }

        this.bids.add(newBid);
    }

    public cancel(): void {
        (this.status as string) = 'cancelled';
    }

    public incrementVersion(): void {
        (this.updatedAt as Date) = new Date();
    }
}

export const newAuctionId = (): AuctionId => {
    return uuid() as AuctionId;
};
