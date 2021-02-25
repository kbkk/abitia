import { Inject, Injectable } from '@nestjs/common';
import jwtVerify from 'jose/jwt/verify';
import * as z from 'zod';


import { AccountContextConfig } from './Configs/AccountContextConfig';
import { Account } from './Entities/Account';
import { ACCOUNT_REPOSITORY, AccountRepository } from './Repositories/AccountRepository';

const tokenPayload = z.object({
    accountId: z.string().uuid(),
});

export type TokenPayload = z.infer<typeof tokenPayload>;

/**
 * A gateway to be used by external contexts
 */
@Injectable()
export class AccountContextGateway {
    public constructor(
        @Inject(ACCOUNT_REPOSITORY)
        private readonly accountRepository: AccountRepository,
        private readonly config: AccountContextConfig,
    ) {
    }

    public findAccountById(accountId: string): Promise<Account | undefined> {
        return this.accountRepository.findById(accountId);
    }

    public async decodeAuthToken(token: string): Promise<TokenPayload>  {
        const key = Buffer.from(this.config.jwtSecretKey);
        const { payload } = await jwtVerify(token, key);

        return tokenPayload.parse(payload);
    }
}
