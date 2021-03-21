import { EventBus } from '../../../Core/EventBus';
import { InMemoryEventBus } from '../../../Core/EventBus/InMemoryEventBus';
import { TestLogger } from '../../../Core/Testing';
import { Account, newAccountId } from '../../Entities/Account';
import { AccountCreatedEvent } from '../../Events/AccountCreatedEvent';
import { AccountRepository } from '../../Repositories/AccountRepository';
import { InMemoryAccountRepository } from '../../Repositories/InMemoryAccountRepository';
import { SendAccountCreatedEmail } from '../SendAccountCreatedEmail';

describe('SendAccountCreatedEmail', () => {
    let handler: SendAccountCreatedEmail;
    let eventBus: EventBus;
    let accountRepository: AccountRepository;

    beforeAll(() => {
        eventBus = new InMemoryEventBus();
        accountRepository = new InMemoryAccountRepository();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handler = new SendAccountCreatedEmail(
            eventBus,
            accountRepository,
            new TestLogger(),
        );
    });

    it('should generate a confirmation code on AccountCreatedEvent', async () => {
        const account = await Account.create(
            newAccountId(),
            'test@example.com',
            'johnny-test',
        );

        await accountRepository.save(account);

        const event = new AccountCreatedEvent(account.id);
        eventBus.publish(event);

        const updatedAccount = await accountRepository.findById(account.id);

        expect(updatedAccount?.confirmationCode).toHaveLength(32);
    });

    it('should throw if account does not exist', async () => {
        const event = new AccountCreatedEvent(newAccountId());

        // eslint-disable-next-line dot-notation
        await expect(() => handler['handle'](event))
            .rejects
            .toThrowError(/^Could not find account/);
    });
});
