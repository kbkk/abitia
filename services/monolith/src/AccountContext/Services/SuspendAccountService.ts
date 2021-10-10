import { inject, injectable } from 'inversify';

import { LOGGER, Logger } from '../../Core/Logger';
import { OUTBOX, Outbox } from '../../Core/Outbox';
import { AccountSuspendedEvent } from '../Events/AccountSuspendedEvent';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../Repositories/AccountRepository';

import { SuspendAccountCommand } from './Commands/SuspendAccountCommand';

export type SuspendAccountResult = {
    success: boolean;
    message: string;
}

@injectable()
export class SuspendAccountService {
    public constructor(
        @inject(ACCOUNT_REPOSITORY)
        private readonly accountRepository: AccountRepository,
        @inject(OUTBOX)
        private readonly outbox: Outbox,
        @inject(LOGGER)
        private readonly logger: Logger,
    ) {
    }

    public async execute(command: SuspendAccountCommand): Promise<SuspendAccountResult> {
        const { accountId } = command;

        const account = await this.accountRepository.findById(accountId);

        if(!account) {
            return {
                success: false,
                message: 'Account does not exist',
            };
        }

        account.suspend();

        const event = new AccountSuspendedEvent(account.id);
        await this.outbox.send(event);

        // todo: careful, account save must be after outbox send
        // move em.flush away from repository to fix this
        await this.accountRepository.save(account);

        this.logger.info(`Suspended account ${accountId}`);

        return {
            success: true,
            message: 'Account suspended',
        };
    }
}
