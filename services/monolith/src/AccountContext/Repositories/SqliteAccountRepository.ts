import { EntityManager, UniqueConstraintViolationException } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import * as E from '../../Core/Fp/Either';
import { Account, AccountWithThisEmailAlreadyExistsError } from '../Entities/Account';

import { AccountRepository } from './AccountRepository';

@Injectable()
export class SqliteAccountRepository implements AccountRepository {
    public constructor(
        private readonly em: EntityManager,
    ) {
    }

    public async save(newAccount: Account): Promise<E.Either<AccountWithThisEmailAlreadyExistsError, undefined>> {
        try {
            await this.em.persist(newAccount);
            await this.em.flush();
        } catch (error) {
            if(error instanceof UniqueConstraintViolationException) {
                return E.left(new AccountWithThisEmailAlreadyExistsError());
            }

            throw error;
        }

        return E.right(undefined);
    }

    // todo: id: AccountId
    public async findById(id: string): Promise<Account | undefined> {
        const account = await this.em.findOne(Account, { id }) ?? undefined;

        return account;
    }

    public async findByEmail(email: string): Promise<Account | undefined> {
        const account = await this.em.findOne(Account, { email }) ?? undefined;

        return account;
    }
}
