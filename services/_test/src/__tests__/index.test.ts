import * as request from 'supertest';
import {Test} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {AppModule} from "../AppModule";

describe('Tests', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    it(`/GET cats`, async () => {
        const {body} = await request(app.getHttpServer())
            .post('/')
            .send({hello: 123});

        console.log(body);
    });

    afterAll(async () => {
        await app.close();
    });
});
