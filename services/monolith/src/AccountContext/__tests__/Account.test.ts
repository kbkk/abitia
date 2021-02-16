import { InMemoryEventBus } from '../../Core/EventBus/InMemoryEventBus';
import { TestLogger } from '../../Core/Testing';
import { InMemoryAccountRepository } from '../Repositories/InMemoryAccountRepository';
import { CreateAccountService } from '../Services/CreateAccountService';

describe('Account', () => {
    it('should create an account',async () => {
        const repo = new InMemoryAccountRepository();
        const svc = new CreateAccountService(repo, new InMemoryEventBus(), new TestLogger());

        const result = await svc.execute({
            email: 'jakub@test.pl',
            password: 'niebieski8'
        });

        const createdAccount = await repo.findById(result.id);

        expect(createdAccount).toEqual({
            id: expect.any(String),
            email: 'jakub@test.pl',
            confirmed: false,
            password: expect.any(String),
        });
    });
});
