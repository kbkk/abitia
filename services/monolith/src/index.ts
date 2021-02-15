import { once } from 'events';

import { MikroORM } from '@mikro-orm/core';
import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import { AbstractHttpAdapter, NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { AccountContextModule } from './AccountContext/AccountContextModule';
import { AuctionContextModule } from './AuctionContext/AuctionContextModule';
import { NestJsLoggerAdapter } from './Core/Logger';

/**
 * Nest.js doesn't allow overwriting its ExceptionZone
 * The default exception zone kills the process in case any Error is thrown during the initialization process,
 * which doesn't fit us as e.g. INestApplication.get(<service>) throws if the requested <service> cannot be found.
 */
export class MonolithNestFactory {
    public static create(module, serverOrOptions, options): Promise<INestApplication> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ob = NestFactory as any;
        ob.__proto__.createExceptionZone = (receiver, prop) => {
            return (...args) => {
                const result = receiver[prop](...args);
                return result;
            };
        };
        return NestFactory.create(module, serverOrOptions, options);
    }
}

async function createModule(
    module: unknown,
    httpPrefix: string,
    httpAdapter: AbstractHttpAdapter,
    factoryOptions: NestApplicationOptions
): Promise<INestApplication> {
    const nestApp = await MonolithNestFactory.create(module, httpAdapter, factoryOptions);
    nestApp.setGlobalPrefix(httpPrefix);

    const orm = nestApp.get(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();
    await generator.updateSchema();

    try {
        const logger = nestApp.get(NestJsLoggerAdapter);
        nestApp.useLogger(logger);
    } catch (error) {
        console.log(`[${httpPrefix}] Failed to find NestJsLoggerAdapter, using default logger.`);
    }

    return nestApp;
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async function bootstrap() {
    const factoryOptions = { abortOnError: true };
    const express = new ExpressAdapter();

    const accountContext = await createModule(AccountContextModule.forRoot(), '/AccountContext', express, factoryOptions);
    const auctionContext = await createModule(AuctionContextModule, '/AuctionContext', express, factoryOptions);

    // Todo: this may break.
    // Initializing a single nest module registers a 404 handler and modules registered after that one
    // will not register they controllers correctly https://github.com/nestjs/nest/issues/4269
    await Promise.all([
        accountContext.init(),
        auctionContext.init(),
    ]);

    const server = express.listen(3000);
    await once(server, 'listening');
    
    console.log('Nest.js app server started');
})();
