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

interface CreateModuleOptions {
    module: any;
    httpPrefix: string;
    httpAdapter: AbstractHttpAdapter;
    factoryOptions: NestApplicationOptions;
    openApiDocBuilder: DocumentBuilder;
    useCustomLogger?: boolean;
}

async function createModule({
    module,
    httpPrefix,
    httpAdapter,
    factoryOptions,
    openApiDocBuilder,
    useCustomLogger = false,
}: CreateModuleOptions): Promise<INestApplication> {
    const nestApp = await NestFactory.create(module, httpAdapter, factoryOptions);
    nestApp.setGlobalPrefix(httpPrefix);

    const orm = nestApp.get(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();
    await generator.updateSchema();

    if (useCustomLogger) {
        const logger = nestApp.get(NestJsLoggerAdapter);
        nestApp.useLogger(logger);
    }

    const eventBus = nestApp.get<EventBus>(EVENT_BUS);
    eventBusCoordinator.registerChild(eventBus);

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

    const factoryOptions = { abortOnError: true };
    const express = new ExpressAdapter();

    const accountContext = await createModule({
        module: AccountContextModule.forRoot({ eventBusCoordinator }),
        httpPrefix: '/AccountContext',
        httpAdapter: express,
        factoryOptions,
        openApiDocBuilder: new DocumentBuilder()
            .setTitle('Monolith accounts API')
            .setVersion('1.0'),
        useCustomLogger: true,
    });

    const auctionContext = await createModule({
        module: AuctionContextModule.forRoot({ eventBusCoordinator }),
        httpPrefix: '/AuctionContext',
        httpAdapter: express,
        factoryOptions,
        openApiDocBuilder: new DocumentBuilder()
            .setTitle('Monolith auctions API')
            .setVersion('1.0'),
    });

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
