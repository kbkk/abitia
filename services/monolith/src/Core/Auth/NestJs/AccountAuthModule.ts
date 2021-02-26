import { DynamicModule } from '@nestjs/common';

import { AccountContextGateway } from '../../../AccountContext';

import { AccountGuard } from './Guards/AccountGuard';

export class AccountAuthModule {
    public static forRoot(gateway: AccountContextGateway): DynamicModule {
        return {
            module: AccountAuthModule,
            providers: [
                AccountGuard,
                {
                    provide: AccountContextGateway,
                    useValue: gateway,
                },
            ],
            exports: [
                AccountGuard,
                // Guard will not work without exporting the Gateway :(
                AccountContextGateway,
            ],
        };
    }
}
