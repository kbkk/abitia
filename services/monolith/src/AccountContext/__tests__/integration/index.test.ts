import fastify, { FastifyInstance } from 'fastify';
import { interfaces } from 'inversify';
import * as request from 'supertest';

import { runMikroOrmMigrations, waitMs } from '../../../Core/Testing';
import { AccountContextFactory } from '../../AccountContextFactory';
import { AccountContextConfig } from '../../Configs/AccountContextConfig';
import { ACCOUNT_REPOSITORY, AccountRepository } from '../../Repositories/AccountRepository';
import { createTestConfig } from '../utils';

import Container = interfaces.Container;

const JWT_REGEX = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;

describe('Tests', () => {
    let server: FastifyInstance;
    let container: Container;
    let accountRepository: AccountRepository;

    beforeAll(async () => {
        const options = {
            mikroOrmOptions: {
                dbName: ':memory:',
            },
        };

        const accountContextFactory = new AccountContextFactory(options);
        ({ container } = accountContextFactory);

        server = fastify({
            logger: true,
        });

        await server.register(async instance => {
            container
                .rebind(AccountContextConfig)
                .toConstantValue(createTestConfig());
            await accountContextFactory.run(instance);
        });

        await runMikroOrmMigrations(container);

        accountRepository = container.get(ACCOUNT_REPOSITORY);

        await server.ready();
    });

    beforeEach(async () => {
        await runMikroOrmMigrations(container);
    });

    afterAll(() => {
        return server.close();
    });

    it('Should be able to create an account (POST /accounts)', async () => {
        const { body } = await request(server.server)
            .post('/accounts')
            .send({ email: 'jakub@example.com', password: 'LITT UP' })
            .expect(201);

        expect(body).toEqual({
            id: expect.any(String),
            email: 'jakub@example.com',
        });
    });

    it('Should not be able to multiple accounts with same email (POST /accounts)', async () => {
        await request(server.server)
            .post('/accounts')
            .send({ email: 'jakub@example.com', password: 'LITT UP' })
            .expect(201);

        const { body } = await request(server.server)
            .post('/accounts')
            .send({ email: 'jakub@example.com', password: 'LITT UP' })
            .expect(409);

        expect(body).toEqual({
            error: 'Conflict',
            statusCode: 409,
            message: 'Account with this email address already exists',
        });
    });

    it('Should be able to confirm created account (GET /accounts/:accountId/confirm)', async () => {
        const { body: createdAccount } = await request(server.server)
            .post('/accounts')
            .send({ email: 'jakub@example.com', password: 'LITT UP' })
            .expect(201);

        await waitMs(250);

        const { id, confirmationCode } = (await accountRepository.findById(createdAccount.id))!;

        const { body } = await request(server.server)
            .get(`/accounts/${id}/confirm?code=${confirmationCode}`)
            .send()
            .expect(200);

        expect(body).toEqual({
            success: true,
        });
    });

    it('Should be able to create an access token (POST /accounts/me/tokens)', async () => {
        const credentials = { email: 'jakub2@example.com', password: 'LITT UP' };

        const { body: createdAccount } = await request(server.server)
            .post('/accounts')
            .send(credentials)
            .expect(201);

        await waitMs(250);

        const { id, confirmationCode } = (await accountRepository.findById(createdAccount.id))!;

        await request(server.server)
            .get(`/accounts/${id}/confirm?code=${confirmationCode}`)
            .send()
            .expect(200);

        const { body } = await request(server.server)
            .post('/accounts/me/tokens')
            .send(credentials)
            .expect(201);

        expect(body).toEqual({
            token: expect.stringMatching(JWT_REGEX),
        });
    });
});
