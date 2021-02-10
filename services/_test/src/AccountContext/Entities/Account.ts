import {Entity, PrimaryKey, Property} from "@mikro-orm/core";
import * as bcrypt from 'bcrypt';
import {v4 as uuid} from 'uuid';

const SALT_ROUNDS = 12;

// eslint-disable-next-line @typescript-eslint/naming-convention
export type AccountId = string & { __brand: 'AccountId' }

const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, SALT_ROUNDS);

@Entity()
export class Account {
    @PrimaryKey({type: 'string'})
    public readonly id: AccountId;

    @Property()
    public readonly email: string;

    @Property()
    public readonly password: string;

    private constructor(
        id: AccountId,
        email: string,
        password: string,
    ) {
        this.id = id;
        this.email = email;
        this.password = password;
    }

    public async updatePassword(password: string): Promise<void> {
        (this.password as string) = await hashPassword(password);
    }

    public static async create(
        id: AccountId,
        email: string,
        password: string,
    ): Promise<Account> {
        return new Account(
            id,
            email,
            await hashPassword(password)
        );
    }
}

export const newAccountId = (): AccountId => {
    return uuid() as AccountId;
};
