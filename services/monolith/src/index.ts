import { once } from 'events';

import { MikroORM } from '@mikro-orm/core';
import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import { AbstractHttpAdapter, NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { AccountContextModule } from './AccountContext/AccountContextModule';
import { AuctionContextModule } from './AuctionContext/AuctionContextModule';

async function createModule(
    module: unknown,
    httpPrefix: string,
    httpAdapter: AbstractHttpAdapter,
    factoryOptions: NestApplicationOptions
): Promise<INestApplication> {
    const nestApp = await NestFactory.create(module, httpAdapter, factoryOptions);
    nestApp.setGlobalPrefix(httpPrefix);

    const orm = nestApp.get(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();
    await generator.updateSchema();

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
