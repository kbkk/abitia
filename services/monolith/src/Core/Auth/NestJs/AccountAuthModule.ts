import { DynamicModule, ModuleMetadata, Provider } from '@nestjs/common';

import { AuthModuleConfig } from '../types';

import { AccountGuard } from './Guards/AccountGuard';
import { AUTH_MODULE_CONFIG } from './constants';

export interface AccountAuthModuleAsyncOptions
    extends Pick<ModuleMetadata, 'imports'> {
    useFactory: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
    ) => Promise<AuthModuleConfig> | AuthModuleConfig;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
}

export class AccountAuthModule {
    public static registerAsync(options: AccountAuthModuleAsyncOptions): DynamicModule {
        return {
            module: AccountAuthModule,
            imports: options.imports,
            providers: [
                this.createAsyncOptionsProvider(options),
                AccountGuard,
            ],
            exports: [
                AUTH_MODULE_CONFIG,
                AccountGuard,
            ],
        };
    }

    private static createAsyncOptionsProvider(
        options: AccountAuthModuleAsyncOptions,
    ): Provider {
        return {
            provide: AUTH_MODULE_CONFIG,
            useFactory: options.useFactory,
            inject: options.inject ?? [],
        };
    }
}
