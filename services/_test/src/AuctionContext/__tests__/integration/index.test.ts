import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as request from 'supertest';

import {AuctionContextModule} from "../../AuctionContextModule";

describe('Tests', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AuctionContextModule],
        })
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    it(`POST /auctions`, async () => {
        const {body} = await request(app.getHttpServer())
            .post('/auctions')
            .send({item: 'testItem', price: 2137})
            .expect(201);

        expect(body).toEqual({
            "createdAt": expect.any(String),
            "id": expect.any(String),
            "item": "testItem",
            "price": 2137,
            "seller": "sellerId",
            "type": "buy-it-now",
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
