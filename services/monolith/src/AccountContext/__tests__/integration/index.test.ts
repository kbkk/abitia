import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { EVENT_BUS, EventBusCompositeCoordinator } from '../../../Core/EventBus';
import { runMikroOrmMigrations, waitMs } from '../../../Core/Testing';
import { AccountContextModule } from '../../AccountContextModule';
import { AccountContextConfig } from '../../Configs/AccountContextConfig';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../../Repositories/AccountRepository';
import { createTestConfig } from '../utils';

const JWT_REGEX = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;

describe('Tests', () => {
    let app: INestApplication;
    let accountRepository: AccountRepository;

    beforeAll(async () => {
        const eventBusCoordinator = new EventBusCompositeCoordinator();

        const moduleRef = await Test.createTestingModule({
            imports: [
                AccountContextModule.forRoot({
                    mikroOrmOptions: {
                        dbName: ':memory:',
                    },
                    eventBusCoordinator,
                }),
            ],
        })
            .overrideProvider(AccountContextConfig)
            .useValue(createTestConfig())
            .compile();

        app = moduleRef.createNestApplication();

        await runMikroOrmMigrations(app);

        eventBusCoordinator.registerChild(app.get(EVENT_BUS));

        await app.init();

        accountRepository = app.get(ACCOUNT_REPOSITORY);
    });

    beforeEach(async () => {
        await runMikroOrmMigrations(app);
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

    it('Should not be able to multiple accounts with same email (POST /accounts)', async () => {
        await request(app.getHttpServer())
            .post('/accounts')
            .send({ email: 'jakub@example.com', password: 'LITT UP' })
            .expect(201);

        const { body } = await request(app.getHttpServer())
            .post('/accounts')
            .send({ email: 'jakub@example.com', password: 'LITT UP' })
            .expect(409);

        expect(body).toEqual({
            statusCode: 409,
            message: 'Account with this email address already exists',
        });
    });

    it('Should be able to confirm created account (GET /accounts/:accountId/confirm)', async () => {
        const { body: createdAccount } = await request(app.getHttpServer())
            .post('/accounts')
            .send({ email: 'jakub@example.com', password: 'LITT UP' })
            .expect(201);

        await waitMs(250);

        const { id, confirmationCode } = (await accountRepository.findById(createdAccount.id))!;

        const { body } = await request(app.getHttpServer())
            .get(`/accounts/${id}/confirm?code=${confirmationCode}`)
            .send()
            .expect(200);

        expect(body).toEqual({
            success: true,
        });
    });

    it('Should be able to create an access token (POST /accounts/me/tokens)', async () => {
        const credentials = { email: 'jakub2@example.com', password: 'LITT UP' };

        const { body: createdAccount } = await request(app.getHttpServer())
            .post('/accounts')
            .send(credentials)
            .expect(201);

        await waitMs(250);

        const { id, confirmationCode } = (await accountRepository.findById(createdAccount.id))!;

        await request(app.getHttpServer())
            .get(`/accounts/${id}/confirm?code=${confirmationCode}`)
            .send()
            .expect(200);

        const { body } = await request(app.getHttpServer())
            .post('/accounts/me/tokens')
            .send(credentials)
            .expect(201);

        expect(body).toEqual({
            token: expect.stringMatching(JWT_REGEX),
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
