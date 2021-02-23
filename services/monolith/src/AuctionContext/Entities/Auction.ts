import { v4 as uuid } from 'uuid';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type AuctionId = string & { __brand: 'AuctionId' }

export type AuctionTypes = 'buy-it-now' | 'auction';

export class Auction {
    public readonly id: AuctionId;

    public readonly item: string;

    public readonly price: number;

    public readonly type: AuctionTypes;

    public readonly seller: string;

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
