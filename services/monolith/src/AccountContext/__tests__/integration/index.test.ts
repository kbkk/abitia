import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { AccountContextModule } from '../../AccountContextModule';

describe('Tests', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                AccountContextModule.forRoot({
                    mikroOrmOptions: {
                        dbName: ':memory:'
                    }
                })
            ],
        })
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    beforeEach(async () => {
        // todo: write test util for app bootstrap
        const orm = app.get(MikroORM);
        const generator = orm.getSchemaGenerator();
        await generator.dropSchema();
        await generator.createSchema();
    });

    it('Should be able to create an account (POST /accounts)', async () => {
        const { body } = await request(app.getHttpServer())
            .post('/accounts')
            .send({ email: 'jakub@example.com', password: 'LITT UP' })
            .expect(201);

        expect(body).toEqual({
            id: expect.any(String),
            email: 'jakub@example.com',
        });
    });

    it('Should be able to confirm created account (GET /accounts/:accountId/confirm)', async () => {
        const { body: createdAccount } = await request(app.getHttpServer())
            .post('/accounts')
            .send({ email: 'jakub@example.com', password: 'LITT UP' })
            .expect(201);

        const { body } = await request(app.getHttpServer())
            .get(`/accounts/${createdAccount.id}/confirm?code=123123`)
            .send()
            .expect(200);

        expect(body).toEqual({
            success: true,
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
