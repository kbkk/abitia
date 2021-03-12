import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule } from '@nestjs/common';

import { AccountAuthModule } from '../Core/Auth';
import { EventBusCompositeCoordinator, nestJsInMemoryEventBusProvider } from '../Core/EventBus';
import { Logger, LOGGER, nestJsLoggerProvider } from '../Core/Logger';
import { intermediateModule } from '../Core/NestJs';
import { OutboxMessageEntity, OutboxModule, RegisterOutboxWorker } from '../Core/Outbox';

import { AuctionContextConfig } from './Configs/AuctionContextConfig';
import { AuctionController } from './Controllers/AuctionController';
import { AUCTION_REPOSITORY } from './Repositories/AuctionRepository';
import { SqliteAuctionRepository } from './Repositories/SqliteAuctionRepository';
import { CreateAuctionService } from './Services/CreateAuctionService';
import { PlaceAuctionBidService } from './Services/PlaceAuctionBidService';

type AuctionContextModuleOptions = {
    configFactory?: () => AuctionContextConfig
    eventBusCoordinator: EventBusCompositeCoordinator,
}

export class AuctionContextModule {
    public static forRoot(options: AuctionContextModuleOptions): DynamicModule {
        const configModule = intermediateModule({
            provide: AuctionContextConfig,
            useFactory: options?.configFactory ?? AuctionContextConfig.fromEnv,
        });
        const loggerModule = intermediateModule(nestJsLoggerProvider);
        const eventBusModule = intermediateModule(nestJsInMemoryEventBusProvider, loggerModule);

        return {
            module: AuctionContextModule,
            imports: [
                loggerModule,
                eventBusModule,
                AccountAuthModule.registerAsync({
                    imports: [configModule],
                    useFactory: (config: AuctionContextConfig) => ({
                        jwtSecret: config.jwtSecretKey,
                    }),
                    inject: [AuctionContextConfig],
                }),
                OutboxModule.withMikroOrmAsync({
                    imports: [loggerModule],
                    useFactory: (logger: Logger) => ({
                        logger,
                        eventBus: options.eventBusCoordinator,
                    }),
                    inject: [LOGGER],
                }),
                MikroOrmModule.forRoot({
                    entities: ['../../dist/AuctionContext/Entities/*.js', OutboxMessageEntity],
                    entitiesTs: ['../../src/AuctionContext/Entities/*.ts', OutboxMessageEntity],
                    dbName: 'auction-context.sqlite3',
                    type: 'sqlite',
                    baseDir: __dirname,
                    tsNode: typeof jest !== 'undefined',
                }),
            ],
            controllers: [
                AuctionController,
            ],
            providers: [
                RegisterOutboxWorker,
                PlaceAuctionBidService,
                CreateAuctionService,
                {
                    provide: AUCTION_REPOSITORY,
                    useClass: SqliteAuctionRepository,
                },
            ],
        };
    }
}
