import { match } from '../../../Core/Fp/Either';
import { Account, AccountWithThisEmailAlreadyExistsError, newAccountId } from '../../Entities/Account';
import { InMemoryAccountRepository } from '../InMemoryAccountRepository';

let repo: InMemoryAccountRepository;

beforeEach(() => {
    repo = new InMemoryAccountRepository();
});

it('should throw if email is not unique', async () => {
    const email = 'test1@example.com';
    const acc1 = await Account.create(newAccountId(), email, 'password1');
    const acc2 = await Account.create(newAccountId(), email, 'password2');

    await repo.save(acc1);

    match(
        await repo.save(acc2),
        (value) => expect(value).toBeInstanceOf(AccountWithThisEmailAlreadyExistsError),
        () => { throw new Error('Expected to go left'); },
    );
});
