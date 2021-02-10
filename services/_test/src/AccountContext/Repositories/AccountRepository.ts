import {Account} from "../Entities/Account";

export interface AccountRepository {
    save(newAccount: Account): Promise<void>;

    findById(id: string): Promise<Account | undefined>;
}

export const ACCOUNT_REPOSITORY = 'AccountRepository';
