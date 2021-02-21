import { AccountContextConfig } from '../../Configs/AccountContextConfig';

export const createTestConfig = (): AccountContextConfig => {
    return AccountContextConfig.create({
        jwtSecretKey: 'testKey-testKey-testKey-testKey-',
    });
};
