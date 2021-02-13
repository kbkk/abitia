import { Inject } from '@nestjs/common';

import { CreateAccountDto } from '../Dto/CreateAccountDto';
import { Account, newAccountId } from '../Entities/Account';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../Repositories/AccountRepository';

export class CreateAccountService {
    public constructor(
        @Inject(ACCOUNT_REPOSITORY)
        private accountRepository: AccountRepository
    ) {
    }

    public async execute(dto: CreateAccountDto): Promise<Account> {
        const account = await Account.create(newAccountId(), dto.email, dto.password);

        await this.accountRepository.save(account);

        return account;
    }
}
