import * as E from '../../Core/Fp/Either';
import { Account, AccountWithThisEmailAlreadyExistsError } from '../Entities/Account';

export interface AccountRepository {
    save(newAccount: Account): Promise<E.Either<AccountWithThisEmailAlreadyExistsError, undefined>>;

    findById(id: string): Promise<Account | undefined>;

    findByEmail(email: string): Promise<Account | undefined>;
}

export const ACCOUNT_REPOSITORY = 'AccountRepository';
