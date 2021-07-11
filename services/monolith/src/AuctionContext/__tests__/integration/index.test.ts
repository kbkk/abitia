import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { EventBusCompositeCoordinator } from '../../../Core/EventBus';
import { runMikroOrmMigrations } from '../../../Core/Testing';
import { AuctionContextModule } from '../../AuctionContextModule';
import { createTestToken, createTestConfig } from '../utils';

describe('AuctionContext Integration Tests', () => {
    let app: INestApplication;
    const accountId = 'c0ffee12-aaaa-4bbb-bccc-ddddeeeeffff';

    beforeAll(async () => {
        const ctxModule = AuctionContextModule.forRoot({
            configFactory: createTestConfig,
            eventBusCoordinator: new EventBusCompositeCoordinator(),
        });
        const moduleRef = await Test.createTestingModule({
            imports: [ctxModule],
        })
            .compile();

        app = moduleRef.createNestApplication();
        await runMikroOrmMigrations(app);
        await app.init();
    });

    beforeEach(async () => {
        await runMikroOrmMigrations(app);
    });

    it('POST /auctions - Should create an auction', async () => {
        const authToken = await createTestToken(accountId);
        const { body } = await request(app.getHttpServer())
            .post('/auctions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ item: 'testItem', startingPrice: 2137 })
            .expect(201);

        expect(body).toMatchObject({
            createdAt: expect.any(String),
            id: expect.any(String),
            item: 'testItem',
            startingPrice: 2137,
            seller: accountId,
            type: 'buy-it-now',
            bids: [],
        });
    });

    it('POST /auctions/:auctionId/bids - Should add a bid', async () => {
        const authToken = await createTestToken(accountId);
        const { body: auctionBody } = await request(app.getHttpServer())
            .post('/auctions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ item: 'testItem', startingPrice: 2137 })
            .expect(201);
        const auctionId = auctionBody.id;

        await request(app.getHttpServer())
            .post(`/auctions/${auctionId}/bids`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ price: 2137 })
            .expect(201);
    });

    afterAll(async () => {
        await app.close();
    });
});
