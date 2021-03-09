import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DynamicModule } from '@nestjs/common';

import { AccountAuthModule } from '../Core/Auth';
import { EVENT_BUS, EventBus, nestJsInMemoryEventBusProvider } from '../Core/EventBus';
import { Logger, LOGGER, nestJsLoggerProvider } from '../Core/Logger';
import { intermediateModule } from '../Core/NestJs';
import { OutboxMessageEntity } from '../Core/Outbox/MikroOrm/OutboxMessageEntity';
import { OutboxModule } from '../Core/Outbox/NestJs/OutboxModule';

import { RegisterOutboxWorker } from './BackgroundTasks/RegisterOutboxWorker';
import { AuctionContextConfig } from './Configs/AuctionContextConfig';
import { AuctionController } from './Controllers/AuctionController';
import { AUCTION_REPOSITORY } from './Repositories/AuctionRepository';
import { SqliteAuctionRepository } from './Repositories/SqliteAuctionRepository';
import { CreateAuctionService } from './Services/CreateAuctionService';
import { PlaceAuctionBidService } from './Services/PlaceAuctionBidService';

type AuctionContextModuleOptions = {
    configFactory?: () => AuctionContextConfig
}

export class AuctionContextModule {
    public static forRoot(options?: AuctionContextModuleOptions): DynamicModule {
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
                MikroOrmModule.forRoot({
                    entities: ['../../dist/AuctionContext/Entities/*.js', OutboxMessageEntity],
                    entitiesTs: ['../../src/AuctionContext/Entities/*.ts', OutboxMessageEntity],
                    dbName: 'auction-context.sqlite3',
                    type: 'sqlite',
                    baseDir: __dirname,
                    tsNode: typeof jest !== 'undefined',
                    debug: true,
                }),
                OutboxModule.withMikroOrmAsync({
                    imports: [loggerModule,  eventBusModule],
                    useFactory: (logger: Logger, eventBus: EventBus) => ({
                        logger,
                        eventBus,
                    }),
                    inject: [EVENT_BUS, LOGGER],
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
