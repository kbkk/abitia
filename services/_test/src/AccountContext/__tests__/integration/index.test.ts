import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as request from 'supertest';
import {AccountContextModule} from "../../AccountContextModule";

describe('Tests', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AccountContextModule],
        })
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    it(`POST /accounts`, async () => {
        const {body} = await request(app.getHttpServer())
            .post('/accounts')
            .send({email: 'jakub@example.com', password: 'LITT UP'})
            .expect(201);

        expect(body).toEqual({
            id: expect.any(String),
            email: 'jakub@example.com',
            password: 'LITT UP'
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
