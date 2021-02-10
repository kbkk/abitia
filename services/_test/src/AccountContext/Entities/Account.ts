import {v4 as uuid} from 'uuid';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type AccountId = string & { __brand: 'AccountId' }

export class Account {
    public constructor(
        public readonly id: AccountId,
        public readonly email: string,
        public readonly password: string,
    ) {}
}

export const newAccountId = (): AccountId => {
    return uuid() as AccountId;
};
