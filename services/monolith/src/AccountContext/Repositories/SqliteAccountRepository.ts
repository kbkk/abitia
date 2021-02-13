import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import { Account } from '../Entities/Account';

import { AccountRepository } from './AccountRepository';

@Injectable()
export class SqliteAccountRepository implements AccountRepository {
    public constructor(
        private readonly em: EntityManager,
    ) {
    }

    public async save(newAccount: Account): Promise<void> {
        await this.em.persist(newAccount);
    }

    // todo: id: AccountId
    public async findById(id: string): Promise<Account | undefined> {
        const account = await this.em.findOne(Account, { id }) ?? undefined;
        
        return account;
    }
}
