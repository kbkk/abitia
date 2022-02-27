import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { jwtVerify } from 'jose';

import { AuthModuleConfig, tokenPayloadSchema } from '../../types';
import { AUTH_MODULE_CONFIG } from '../constants';
import { RequestWithAccount } from '../types';

@Injectable()
export class AccountGuard implements CanActivate {
    public constructor(
        @Inject(AUTH_MODULE_CONFIG)
        private readonly config: AuthModuleConfig,
    ) {}

    public async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithAccount>();

        const authHeader = request.headers.authorization;

        if(!authHeader) {
            throw new ForbiddenException('Missing Authorization header');
        }

        if(!authHeader.startsWith('Bearer ')) {
            throw new ForbiddenException('Auth token must start with "Bearer "');
        }

        const token = authHeader.slice(7);

        try {
            const key = Buffer.from(this.config.jwtSecret);
            const { payload } = await jwtVerify(token, key);

            request.account = tokenPayloadSchema.parse(payload);
        } catch (error) {
            throw new ForbiddenException('Could not verify the auth token');
        }

        return true;
    }
}
