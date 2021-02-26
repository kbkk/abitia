import { CanActivate, DynamicModule, ExecutionContext, ForbiddenException } from '@nestjs/common';

import { AccountGuard } from '../Auth';
import { RequestWithAccount } from '../Auth/NestJs/types';

export const VALID_AUTH_HEADER = 'Bearer validAuthToken';

export class TestAccountGuard implements CanActivate {
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

        if(authHeader !== VALID_AUTH_HEADER) {
            throw new ForbiddenException('Could not verify the auth token');
        }

        request.account = { accountId: 'c0ffee12-aaaa-bbbb-cccc-ddddeeeeffff' };

        return true;
    }
}

export class TestAccountAuthModule {
    public static forRoot(): DynamicModule {
        return {
            module: TestAccountAuthModule,
            providers: [
                {
                    provide: AccountGuard,
                    useClass: TestAccountGuard,
                },
            ],
            exports: [
                AccountGuard,
            ],
        };
    }
}
