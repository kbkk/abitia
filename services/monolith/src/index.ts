import { once } from 'events';
import * as path from 'path';

import { patchNestjsSwagger } from '@abitia/zod-dto';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { NestFactoryStatic } from '@nestjs/core/nest-factory';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config as configureDotenv } from 'dotenv';

import { AccountContextModule } from './AccountContext/AccountContextModule';
import { AuctionContextModule } from './AuctionContext/AuctionContextModule';
import { NestJsLoggerAdapter } from './Core/Logger';

patchNestjsSwagger();

/**
 * Nest.js doesn't allow overwriting its ExceptionZone
 * The default exception zone kills the process in case any Error is thrown during the initialization process,
 * which doesn't fit us as e.g. INestApplication.get(<service>) throws if the requested <service> cannot be found.
 */
export class MonolithNestFactory extends NestFactoryStatic {
    public constructor() {
        super();

        // createExceptionZone is private, force override
        // eslint-disable-next-line dot-notation
        this['createExceptionZone'] = (receiver, prop) => {
            return (...args) => {
                const result = receiver[prop!](...args);
                return result;
            };
        };
    }
}

const nestFactory = new MonolithNestFactory();

async function createModule(
    module: unknown,
    httpPrefix: string,
    httpAdapter: AbstractHttpAdapter,
    factoryOptions: NestApplicationOptions,
    openApiDocBuilder: DocumentBuilder,
): Promise<INestApplication> {
    const nestApp = await nestFactory.create(module, httpAdapter, factoryOptions);
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

    const accountOpenApi = new DocumentBuilder()
        .setTitle('Monolith accounts API')
        .setVersion('1.0');
    const accountContext = await createModule(
        AccountContextModule.forRoot(),
        '/AccountContext',
        express,
        factoryOptions,
        accountOpenApi,
    );

    const auctionsOpenApi = new DocumentBuilder()
        .setTitle('Monolith auctions API')
        .setVersion('1.0');
    const auctionContext = await createModule(
        AuctionContextModule.forRoot(),
        '/AuctionContext',
        express,
        factoryOptions,
        auctionsOpenApi,
    );

    // Todo: this may break.
    // Initializing a single nest module registers a 404 handler and modules registered after that one
    // will not register their controllers correctly https://github.com/nestjs/nest/issues/4269
    await Promise.all([
        accountContext.init(),
        auctionContext.init(),
    ]);

    const server = express.listen(3000);
    await once(server, 'listening');

    console.log('Nest.js app server started');
})();
