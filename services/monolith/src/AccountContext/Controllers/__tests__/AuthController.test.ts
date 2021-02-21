import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { AccountContextModule } from '../../AccountContextModule';
import { AccountContextConfig } from '../../Configs/AccountContextConfig';
import { CreateAuthTokenService } from '../../Services/CreateAuthTokenService';
import { createTestConfig } from '../../__tests__/utils';

type PublicInterface<T> = {[K in keyof T]: T[K]};

describe('AuthController', () => {
    let app: INestApplication;
    let createAuthTokenService: jest.Mocked<PublicInterface<CreateAuthTokenService>>;

    beforeAll(async () => {
        createAuthTokenService = {
            execute: jest.fn(),
        };

        const moduleRef = await Test.createTestingModule({
            imports: [
                AccountContextModule.forRoot({
                    mikroOrmOptions: {
                        dbName: ':memory:',
                    },
                }),
            ],
        })
            .overrideProvider(CreateAuthTokenService)
            .useValue(createAuthTokenService)
            .overrideProvider(AccountContextConfig)
            .useValue(createTestConfig())
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return 201 with token on success', async () => {
        createAuthTokenService.execute.mockResolvedValue({ success: true, token: 'testToken' });

        const { body } = await request(app.getHttpServer())
            .post('/accounts/me/tokens')
            .send({ email: 'testEmail', password: 'testUsername' })
            .expect(201);

        expect(body).toEqual({
            token: 'testToken',
        });
    });

    it('should return 401 with error message on failure', async () => {
        createAuthTokenService.execute.mockResolvedValue({ success: false, message: 'Invalid credentials' });

        const { body } = await request(app.getHttpServer())
            .post('/accounts/me/tokens')
            .send({ email: 'testEmail', password: 'testUsername' })
            .expect(401);

        expect(body).toEqual({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid credentials',
        });
    });

    it('should return 422 on input validation failure', async () => {
        createAuthTokenService.execute.mockResolvedValue({ success: false, message: 'Invalid credentials' });

        const { body } = await request(app.getHttpServer())
            .post('/accounts/me/tokens')
            .send({ email: undefined, password: undefined })
            .expect(422);

        expect(body).toEqual({
            statusCode: 422,
            error: 'Unprocessable Entity',
            message: 'Input validation failed: email: Required, password: Required',
        });
    });
});
