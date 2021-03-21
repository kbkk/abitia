import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

const SALT_ROUNDS = 12;

// eslint-disable-next-line @typescript-eslint/naming-convention
export type AccountId = string & { __brand: 'AccountId' }

const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, SALT_ROUNDS);

export class AccountWithThisEmailAlreadyExistsError extends Error {}

@Entity()
export class Account {
    @PrimaryKey({ type: 'string' })
    public readonly id: AccountId;

    @Property({ type: 'string', unique: true })
    public readonly email: string;

    @Property({ type: 'string' })
    public readonly password: string;

    @Property({ type: 'string', nullable: true })
    public readonly confirmationCode?: string;

    @Property({ type: 'boolean' })
    public readonly confirmed: boolean;

    private constructor(
        id: AccountId,
        email: string,
        password: string,
    ) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.confirmed = false;
    }

    public async updatePassword(password: string): Promise<void> {
        (this.password as string) = await hashPassword(password);
    }

    public setConfirmationCode(code: string): void {
        (this.confirmationCode as string) = code;
    }

    public markAsConfirmed(): void {
        (this.confirmed as boolean) = true;
    }

    public static async create(
        id: AccountId,
        email: string,
        password: string,
    ): Promise<Account> {
        return new Account(
            id,
            email,
            await hashPassword(password),
        );
    }
}

export const newAccountId = (): AccountId => {
    return uuid() as AccountId;
};
