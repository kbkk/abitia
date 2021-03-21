import * as E from '../../Core/Fp/Either';
import { Account, AccountWithThisEmailAlreadyExistsError } from '../Entities/Account';

import { AccountRepository } from './AccountRepository';

export class InMemoryAccountRepository implements AccountRepository {
    private accounts: Account[] = [];

    public async save(newAccount: Account): Promise<E.Either<AccountWithThisEmailAlreadyExistsError, undefined>> {
        const existingIndex = this.accounts.findIndex(account => account.id === newAccount.id);

        if (existingIndex !== -1) {
            this.accounts[existingIndex] = newAccount;
        } else {
            const exists = !!(await this.findByEmail(newAccount.email));

            if(exists) {
                return E.left(new AccountWithThisEmailAlreadyExistsError());
            }

            this.accounts.push(newAccount);
        }

        return E.right(undefined);
    }

    // todo: id: AccountId
    public findById(id: string): Promise<Account | undefined> {
        const account = this.accounts.find(account => account.id === id);

        return Promise.resolve(account);
    }

    public findByEmail(email:string): Promise<Account | undefined> {
        const account = this.accounts.find(account => account.email === email);

        return Promise.resolve(account);
    }
}
