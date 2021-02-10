import {Entity, PrimaryKey, Property} from "@mikro-orm/core";
import {v4 as uuid} from 'uuid';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type AccountId = string & { __brand: 'AccountId' }

@Entity()
export class Account {
    @PrimaryKey({type: 'string'})
    public readonly id: AccountId;

    @Property()
    public readonly email: string;

    @Property()
    public readonly password: string;

    public constructor(
        id: AccountId,
        email: string,
        password: string,
    ) {
        this.id = id;
        this.email = email;
        this.password = password;
    }
}

export const newAccountId = (): AccountId => {
    return uuid() as AccountId;
};
