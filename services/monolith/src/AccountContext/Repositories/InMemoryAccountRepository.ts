import { Account } from '../Entities/Account';

import { AccountRepository } from './AccountRepository';

export class InMemoryAccountRepository implements AccountRepository {
    private accounts: Account[] = [];

    public save(newAccount: Account): Promise<void> {
        const existingIndex = this.accounts.findIndex(account => account.id === newAccount.id);

        if (existingIndex !== -1) {
            this.accounts[existingIndex] = newAccount;
        } else {
            this.accounts.push(newAccount);
        }

        return Promise.resolve();
    }

    // todo: id: AccountId
    public findById(id: string): Promise<Account | undefined> {
        const account = this.accounts.find(account => account.id === id);

        return Promise.resolve(account);
    }
}
