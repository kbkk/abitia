import { Inject } from '@nestjs/common';

import { EVENT_BUS, EventBus } from '../../Core/EventBus';
import { AccountId } from '../Entities/Account';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../Repositories/AccountRepository';

export type ConfirmAccountResult = {
    success: true;
} | {
    success: false;
    message: string;
}

export class ConfirmAccountService {
    public constructor(
        @Inject(ACCOUNT_REPOSITORY)
        private readonly accountRepository: AccountRepository,
        @Inject(EVENT_BUS)
        private readonly eventBus: EventBus,
    ) {
    }

    public async execute(accountId: AccountId, code: string): Promise<ConfirmAccountResult> {
        const account = await this.accountRepository.findById(accountId);

        if(!account) {
            return { success: false, message: 'Account not found' };
        }

        if(account.confirmed) {
            return { success: false, message: 'Account already confirmed' };
        }

        if(account.confirmationCode !== code) {
            return { success: false, message: 'Invalid confirmation code' };
        }

        account.markAsConfirmed();
        await this.accountRepository.save(account);

        return { success: true };
    }
}
