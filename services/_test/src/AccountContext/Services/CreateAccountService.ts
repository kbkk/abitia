import {CreateAccountDto} from "../Dto/CreateAccountDto";
import {Account, newAccountId} from "../Entities/Account";
import {InMemoryAccountRepository} from "../Repositories/InMemoryAccountRepository";

export class CreateAccountService {
    public constructor(
        private accountRepository: InMemoryAccountRepository
    ) {
    }

    public async execute(dto: CreateAccountDto): Promise<Account> {
        const account = new Account(newAccountId(), dto.email, dto.password);

        await this.accountRepository.save(account);

        return account;
    }
}
