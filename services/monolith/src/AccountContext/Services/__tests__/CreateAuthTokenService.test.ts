import jwtVerify from 'jose/jwt/verify';

import { TestLogger } from '../../../Core/Testing';
import { Account, newAccountId } from '../../Entities/Account';
import { InMemoryAccountRepository } from '../../Repositories/InMemoryAccountRepository';
import {
    CreateAuthTokenResultFailure,
    CreateAuthTokenResultSuccess,
    CreateAuthTokenService,
} from '../CreateAuthTokenService';

describe('CreateAuthTokenService', () => {
    let account: Account;
    let service: CreateAuthTokenService;

    beforeAll(async () => {
        account = await Account.create(
            newAccountId(),
            'jakub@test.pl',
            'niebieski8',
        );

        const repo = new InMemoryAccountRepository();

        await repo.save(account);

        service = new CreateAuthTokenService(repo, new TestLogger());
    });

    it('should create a jwt token given valid credentials',async () => {
        const result = await service.execute({
            email: 'jakub@test.pl',
            password: 'niebieski8',
        }) as CreateAuthTokenResultSuccess;

        const key = Buffer.from('testKey-testKey-testKey-testKey-');
        const { payload } = await jwtVerify(result.token, key);

        expect(payload.accountId).toBe(account.id);
        expect(payload.iss).toBe('monolith:account-context');
        expect(payload.aud).toBe('monolith:*');
    });

    it('should fail with "Invalid credentials" on non-existent account',async () => {
        const result = await service.execute({
            email: 'it-does-not-exist@example.com',
            password: 'niebieski8',
        }) as CreateAuthTokenResultFailure;


        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid credentials');
    });

    it('should fail with "Invalid credentials" on invalid password',async () => {
        const result = await service.execute({
            email: 'jakub@test.pl',
            password: 'invalid-password',
        }) as CreateAuthTokenResultFailure;


        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid credentials');
    });
});
