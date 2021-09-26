import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { inject, injectable } from 'inversify';
import SignJWT from 'jose/jwt/sign';

import { LOGGER, Logger } from '../../Core/Logger';
import { AccountContextConfig } from '../Configs/AccountContextConfig';
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

@injectable()
export class CreateAuthTokenService {
    public constructor(
        @inject(ACCOUNT_REPOSITORY)
        private readonly accountRepository: AccountRepository,
        @inject(LOGGER)
        private readonly logger: Logger,
        private readonly config: AccountContextConfig,
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

        if(!account.isActive()) {
            return {
                success: false,
                message: 'Please confirm the account first',
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

        const key = Buffer.from(this.config.jwtSecretKey);
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
