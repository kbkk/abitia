import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { AuctionContextModule } from '../../AuctionContextModule';
import { createTestToken, createTestConfig } from '../utils';

describe('AuctionContext Integration Tests', () => {
    let app: INestApplication;
    const accountId = 'c0ffee12-aaaa-bbbb-cccc-ddddeeeeffff';

    beforeAll(async () => {
        const ctxModule = AuctionContextModule.forRoot({
            configFactory: createTestConfig,
        });
        const moduleRef = await Test.createTestingModule({
            imports: [ctxModule],
        })
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    it('POST /auctions - Should create an auction', async () => {
        const authToken = await createTestToken(accountId);
        const { body } = await request(app.getHttpServer())
            .post('/auctions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ item: 'testItem', price: 2137 })
            .expect(201);

        expect(body).toEqual({
            'createdAt': expect.any(String),
            'id': expect.any(String),
            'item': 'testItem',
            'price': 2137,
            'seller': accountId,
            'type': 'buy-it-now',
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
