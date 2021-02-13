import { Entity, PrimaryKey, Property, TimeType } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type AuctionId = string & { __brand: 'AuctionId' }

export type AuctionTypes = 'buy-it-now' | 'auction';

@Entity()
export class Auction {
    @PrimaryKey({ type: 'string' })
    public readonly id: AuctionId;

    @Property({ type: 'string' })
    public readonly item: string;

    @Property({ type: 'number' })
    public readonly price: number;

    @Property({ type: 'string' })
    public readonly type: AuctionTypes;

    @Property({ type: 'string' })
    public readonly seller: string;

    @Property({ type: TimeType })
    public readonly createdAt: Date;

    private constructor(
        id: AuctionId,
        item: string,
        price: number,
        type: AuctionTypes,
        seller: string,
        createdAt: Date,
    ) {
        this.id = id;
        this.item = item;
        this.price = price;
        this.type = type;
        this.seller = seller;
        this.createdAt = createdAt;
    }

    public static create(
        id: AuctionId,
        item: string,
        price: number,
        type: AuctionTypes,
        seller: string,
    ): Auction {
        return new Auction(
            id,
            item,
            price,
            type,
            seller,
            new Date(),
        );
    }
}

export const newAuctionId = (): AuctionId => {
    return uuid() as AuctionId;
};
