import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

import { AccountContextGateway } from '../../../../AccountContext';
import { RequestWithAccount } from '../types';

@Injectable()
export class AccountGuard implements CanActivate {
    public constructor(
        private readonly accountContextGateway: AccountContextGateway,
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
            const decoded = await this.accountContextGateway.decodeAuthToken(token);
            request.account = decoded;
        } catch (error) {
            throw new ForbiddenException('Could not verify the auth token');
        }

        return true;
    }
}
