import { InMemoryAccountRepository } from '../Repositories/InMemoryAccountRepository';
import { CreateAccountService } from '../Services/CreateAccountService';

describe('Account', () => {
    it('should create an account',async () => {
        const repo = new InMemoryAccountRepository();
        const svc = new CreateAccountService(repo);

        const result = await svc.execute({
            email: 'jakub@test.pl',
            password: 'niebieski8'
        });

        const createdAccount = await repo.findById(result.id);

        expect(createdAccount).toEqual({
            id: expect.any(String),
            email: 'jakub@test.pl',
            password: 'niebieski8'
        });
    });
});