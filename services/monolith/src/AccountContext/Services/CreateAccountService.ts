import { Inject } from '@nestjs/common';

import { LOGGER, Logger } from '../../Core/Logger';
import { OUTBOX, Outbox } from '../../Core/Outbox';
import { CreateAccountDto } from '../Dto/CreateAccountDto';
import { Account, newAccountId } from '../Entities/Account';
import { AccountCreatedEvent } from '../Events/AccountCreatedEvent';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../Repositories/AccountRepository';

export class CreateAccountService {
    public constructor(
        @Inject(ACCOUNT_REPOSITORY)
        private readonly accountRepository: AccountRepository,
        @Inject(OUTBOX)
        private readonly outbox: Outbox,
        @Inject(LOGGER)
        private readonly logger: Logger,
    ) {
    }

    public async execute(dto: CreateAccountDto): Promise<Account> {
        const account = await Account.create(newAccountId(), dto.email, dto.password);

        const event = new AccountCreatedEvent(account.id);
        await this.outbox.send(event);

        // todo: careful, account save must be after outbox send
        // move em.flush away from repository to fix this
        await this.accountRepository.save(account);

        this.logger.info(`Created account ${account.id}`);

        return account;
    }
}
