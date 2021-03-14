import { TestOutbox } from '../../Core/Outbox/Testing';
import { TestLogger } from '../../Core/Testing';
import { InMemoryAccountRepository } from '../Repositories/InMemoryAccountRepository';
import { CreateAccountService } from '../Services/CreateAccountService';

describe('Account', () => {
    it('should create an account',async () => {
        const repo = new InMemoryAccountRepository();
        const outbox = new TestOutbox();
        const svc = new CreateAccountService(repo, outbox, new TestLogger());

        const result = await svc.execute({
            email: 'jakub@test.pl',
            password: 'niebieski8',
        });

        const createdAccount = await repo.findById(result.id);

        expect(createdAccount).toEqual({
            id: expect.any(String),
            email: 'jakub@test.pl',
            confirmed: false,
            password: expect.any(String),
        });
        expect(outbox.sentEvents).toHaveLength(1);
    });
});
