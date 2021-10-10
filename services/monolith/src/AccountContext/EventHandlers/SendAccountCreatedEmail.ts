import * as crypto from 'crypto';

import { inject, injectable } from 'inversify';

import { EVENT_BUS, EventBus } from '../../Core/EventBus';
import { Logger, LOGGER } from '../../Core/Logger';
import { AccountCreatedEvent } from '../Events/AccountCreatedEvent';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../Repositories/AccountRepository';

@injectable()
export class SendAccountCreatedEmail {
    public constructor(
        @inject(EVENT_BUS)
        private readonly eventBus: EventBus,
        @inject(ACCOUNT_REPOSITORY)
        private readonly accountRepository: AccountRepository,
        @inject(LOGGER)
        private readonly logger: Logger,
    ) {
        this.eventBus.subscribe(AccountCreatedEvent, this.handle.bind(this));
    }

    private async handle(event: AccountCreatedEvent): Promise<void> {
        const account = await this.accountRepository.findById(event.accountId);

        if(!account) {
            throw new Error(`Could not find account ${event.accountId}`);
        }

        const code = crypto.randomBytes(16).toString('hex');
        account.setConfirmationCode(code);

        await this.accountRepository.save(account);

        this.logger.info(`Confirmation code set for account ${event.accountId}`);
    }
}
