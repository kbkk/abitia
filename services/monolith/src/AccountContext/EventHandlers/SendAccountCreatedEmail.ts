import { Inject, Injectable } from '@nestjs/common';

import { EVENT_BUS, EventBus } from '../../Core/EventBus';
import { AccountCreatedEvent } from '../Events/AccountCreatedEvent';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../Repositories/AccountRepository';

@Injectable()
export class SendAccountCreatedEmail {
    public constructor(
        @Inject(EVENT_BUS)
        private readonly eventBus: EventBus,
        @Inject(ACCOUNT_REPOSITORY)
        private readonly accountRepository: AccountRepository,
    ) {
        this.eventBus.subscribe(AccountCreatedEvent, this.handle.bind(this));
    }
    
    private async handle(event: AccountCreatedEvent): Promise<void> {
        const account = await this.accountRepository.findById(event.accountId);

        if(!account) {
            throw new Error(`Could not find account ${event.accountId}`);
        }

        account.setConfirmationCode('123123');

        await this.accountRepository.save(account);
    }
}
