import { AuctionContextConfig } from '../../Configs/AuctionContextConfig';

export const createTestConfig = (): AuctionContextConfig => {
    return AuctionContextConfig.create({
        jwtSecretKey: 'testKey-testKey-testKey-testKey-',
    });
};
