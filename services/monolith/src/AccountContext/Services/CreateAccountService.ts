import { Inject } from '@nestjs/common';

import { EVENT_BUS, EventBus } from '../../Core/EventBus';
import { CreateAccountDto } from '../Dto/CreateAccountDto';
import { Account, newAccountId } from '../Entities/Account';
import { AccountCreatedEvent } from '../Events/AccountCreatedEvent';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../Repositories/AccountRepository';

export class CreateAccountService {
    public constructor(
        @Inject(ACCOUNT_REPOSITORY)
        private readonly accountRepository: AccountRepository,
        @Inject(EVENT_BUS)
        private readonly eventBus: EventBus
    ) {
    }

    public async execute(dto: CreateAccountDto): Promise<Account> {
        const account = await Account.create(newAccountId(), dto.email, dto.password);

        await this.accountRepository.save(account);
        
        this.eventBus.publish(
            new AccountCreatedEvent(account.id)
        );

        return account;
    }
}
