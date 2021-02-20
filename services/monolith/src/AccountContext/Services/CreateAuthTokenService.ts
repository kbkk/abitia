import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import SignJWT from 'jose/jwt/sign';

import { LOGGER, Logger } from '../../Core/Logger';
import { CreateAuthTokenDto } from '../Dto/CreateAuthTokenDto';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../Repositories/AccountRepository';

export type CreateAuthTokenResultSuccess = {
    success: true;
    token: string;
}

export type CreateAuthTokenResultFailure = {
    success: false;
    message: string;
}

export type CreateAuthTokenResult = CreateAuthTokenResultSuccess | CreateAuthTokenResultFailure;

export class CreateAuthTokenService {
    public constructor(
        @Inject(ACCOUNT_REPOSITORY)
        private readonly accountRepository: AccountRepository,
        @Inject(LOGGER)
        private readonly logger: Logger,
    ) {
    }

    public async execute(dto: CreateAuthTokenDto): Promise<CreateAuthTokenResult> {
        const account = await this.accountRepository.findByEmail(dto.email);

        if(!account) {
            return {
                success: false,
                message: 'Invalid credentials',
            };
        }

        const isEqual = await bcrypt.compare(dto.password, account.password);

        if(!isEqual) {
            return {
                success: false,
                message: 'Invalid credentials',
            };
        }

        this.logger.info(`Created auth token for account ${account.id}`);

        const key = Buffer.from('testKey-testKey-testKey-testKey-');
        const jwt = await new SignJWT({ 'accountId': account.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setIssuer('monolith:account-context')
            .setAudience('monolith:*')
            .setExpirationTime('12h')
            .sign(key);

        return {
            success: true,
            token: jwt,
        };
    }
}
