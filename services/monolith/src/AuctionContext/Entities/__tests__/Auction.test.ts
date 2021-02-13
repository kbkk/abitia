import { Auction, newAuctionId } from '../Auction';

describe('Auction', () => {
    it('should create a new Auction object', () => {
        const auction = Auction.create(
            newAuctionId(),
            'testItem',
            1000,
            'buy-it-now',
            'testSeller'
        );

        expect(auction).toEqual({
            'createdAt': expect.any(Date),
            'id': expect.any(String),
            'item': 'testItem',
            'price': 1000,
            'seller': 'testSeller',
            'type': 'buy-it-now',
        });
    });
});
