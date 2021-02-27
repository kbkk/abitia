import { DynamicModule } from '@nestjs/common';

import { AccountContextGateway, TokenPayload } from '../../AccountContext';
import { AccountGuard } from '../Auth';

const VALID_AUTH_TOKEN = 'validAuthToken';
export const VALID_AUTH_HEADER = `Bearer ${VALID_AUTH_TOKEN}`;

export class TestAccountModuleGateway {
    public async decodeAuthToken(token: string): Promise<TokenPayload> {
        if(token !== VALID_AUTH_TOKEN) {
            throw new Error('[test mode] Invalid auth token');
        }

        return  { accountId: 'c0ffee12-aaaa-bbbb-cccc-ddddeeeeffff' };
    }
}

export class TestAccountAuthModule {
    public static forRoot(): DynamicModule {
        return {
            module: TestAccountAuthModule,
            providers: [
                {
                    provide: AccountContextGateway,
                    useClass: TestAccountModuleGateway,
                },
                AccountGuard,
            ],
            exports: [
                AccountContextGateway,
                AccountGuard,
            ],
        };
    }
}
