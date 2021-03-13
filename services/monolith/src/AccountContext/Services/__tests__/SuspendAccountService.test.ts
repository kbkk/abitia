import { TestOutbox } from '../../../Core/Outbox/Testing';
import { TestLogger } from '../../../Core/Testing';
import { Account, newAccountId } from '../../Entities/Account';
import { AccountSuspendedEvent } from '../../Events/AccountSuspendedEvent';
import { AccountRepository } from '../../Repositories/AccountRepository';
import { InMemoryAccountRepository } from '../../Repositories/InMemoryAccountRepository';
import { SuspendAccountCommand } from '../Commands/SuspendAccountCommand';
import { SuspendAccountService } from '../SuspendAccountService';

describe('SuspendAccountService', () => {
    let account: Account;
    let accountRepository: AccountRepository;
    let outbox: TestOutbox;
    let service: SuspendAccountService;

    beforeEach(async () => {
        account = await Account.create(
            newAccountId(),
            'jakub@test.pl',
            'niebieski8',
        );
        accountRepository = new InMemoryAccountRepository();
        outbox = new TestOutbox();
        service = new SuspendAccountService(accountRepository, outbox, new TestLogger());

        await accountRepository.save(account);
    });

    it('should fail on non-existent account', async () => {
        const command = SuspendAccountCommand.create({
            accountId: newAccountId(),
        });

        const result = await service.execute(command);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Account does not exist');
    });

    it('should suspend the account', async () => {
        const command = SuspendAccountCommand.create({
            accountId: account.id,
        });

        const result = await service.execute(command);

        const updatedAccount = await accountRepository.findById(account.id);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Account suspended');
        expect(updatedAccount?.suspended).toBe(true);
    });

    it('should emit AccountSuspendedEvent', async () => {
        const command = SuspendAccountCommand.create({
            accountId: account.id,
        });

        await service.execute(command);

        expect(outbox.sentEvents).toHaveLength(1);
        expect(outbox.sentEvents[0]).toBeInstanceOf(AccountSuspendedEvent);
    });
});
