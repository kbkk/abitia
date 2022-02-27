import { jwtVerify } from 'jose';

import { TestLogger } from '../../../Core/Testing';
import { AccountContextConfig } from '../../Configs/AccountContextConfig';
import { Account, newAccountId } from '../../Entities/Account';
import { AccountRepository } from '../../Repositories/AccountRepository';
import { InMemoryAccountRepository } from '../../Repositories/InMemoryAccountRepository';
import { createTestConfig } from '../../__tests__/utils';
import {
    CreateAuthTokenResultFailure,
    CreateAuthTokenResultSuccess,
    CreateAuthTokenService,
} from '../CreateAuthTokenService';

describe('CreateAuthTokenService', () => {
    let account: Account;
    let accountRepository: AccountRepository;
    let config: AccountContextConfig;
    let service: CreateAuthTokenService;
    const jwtSecretKey = 'testKey-testKey-testKey-testKey-';

    beforeEach(async () => {
        account = await Account.create(
            newAccountId(),
            'jakub@test.pl',
            'niebieski8',
        );
        accountRepository = new InMemoryAccountRepository();
        config = createTestConfig();
        service = new CreateAuthTokenService(accountRepository, new TestLogger(), config);

        await accountRepository.save(account);
    });

    it('should create a jwt token given valid credentials',async () => {
        account.markAsConfirmed();
        await accountRepository.save(account);

        const result = await service.execute({
            email: 'jakub@test.pl',
            password: 'niebieski8',
        }) as CreateAuthTokenResultSuccess;

        const key = Buffer.from(jwtSecretKey);
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
        account.markAsConfirmed();
        await accountRepository.save(account);

        const result = await service.execute({
            email: 'jakub@test.pl',
            password: 'invalid-password',
        }) as CreateAuthTokenResultFailure;

        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid credentials');
    });

    it('should fail with "Please confirm the account first" if account is not confirmed',async () => {
        const result = await service.execute({
            email: 'it-does-not-exist@example.com',
            password: 'niebieski8',
        }) as CreateAuthTokenResultFailure;

        expect(account.confirmed).toBe(false);
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid credentials');
    });

    it('should fail with "Please confirm the account first" if account is suspended',async () => {
        // todo: differentiate message, perhaps should be "The account is suspended"
        account.markAsConfirmed();
        account.suspend();

        const result = await service.execute({
            email: 'it-does-not-exist@example.com',
            password: 'niebieski8',
        }) as CreateAuthTokenResultFailure;

        expect(account.confirmed).toBe(true);
        expect(account.suspended).toBe(true);
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid credentials');
    });
});
