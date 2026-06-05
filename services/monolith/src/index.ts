/* istanbul ignore file */
import { once } from 'events';
import * as path from 'path';

import { patchNestjsSwagger } from '@abitia/zod-dto';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import { AbstractHttpAdapter, NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config as configureDotenv } from 'dotenv';

import { AccountContextModule } from './AccountContext/AccountContextModule';
import { AuctionContextModule } from './AuctionContext/AuctionContextModule';
import { EVENT_BUS, EventBus, EventBusCompositeCoordinator } from './Core/EventBus';
import { NestJsLoggerAdapter } from './Core/Logger';

patchNestjsSwagger();
const eventBusCoordinator = new EventBusCompositeCoordinator();

async function createModule(
    module: any,
    httpPrefix: string,
    httpAdapter: AbstractHttpAdapter,
    factoryOptions: NestApplicationOptions,
    openApiDocBuilder: DocumentBuilder,
): Promise<INestApplication> {
    const nestApp = await NestFactory.create(module, httpAdapter, factoryOptions);
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

    try {
        const eventBus = nestApp.get<EventBus>(EVENT_BUS);

        eventBusCoordinator.registerChild(eventBus);
    } catch (error) {
        console.log(`[${httpPrefix}] Failed to find EventBus, registration skipped.`);
    }

    const document = SwaggerModule.createDocument(nestApp, openApiDocBuilder.build());
    SwaggerModule.setup(`${httpPrefix}/api`, nestApp, document);

    return nestApp;
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async function bootstrap() {
    const { error } = configureDotenv({ path: path.resolve(__dirname, '..', '.env') });
    if(error) {
        console.error('Failed to load the .env file');
        throw error;
    }

    const factoryOptions = { abortOnError: false };
    const express = new ExpressAdapter();

    const accountOpenApi = new DocumentBuilder()
        .setTitle('Monolith accounts API')
        .setVersion('1.0');
    const accountContext = await createModule(
        AccountContextModule.forRoot({ eventBusCoordinator }),
        '/AccountContext',
        express,
        factoryOptions,
        accountOpenApi,
    );

    const auctionsOpenApi = new DocumentBuilder()
        .setTitle('Monolith auctions API')
        .setVersion('1.0');
    const auctionContext = await createModule(
        AuctionContextModule.forRoot({ eventBusCoordinator }),
        '/AuctionContext',
        express,
        factoryOptions,
        auctionsOpenApi,
    );

    // Each init() appends a 404 catch-all middleware to the shared Express instance
    // (see ExpressAdapter.setNotFoundHandler). Sequential init would cause the first
    // module's 404 handler to swallow the second module's routes.
    await Promise.all([
        accountContext.init(),
        auctionContext.init(),
    ]);

    const server = express.listen(3000);
    await once(server, 'listening');

    console.log('Nest.js app server started');
})();
