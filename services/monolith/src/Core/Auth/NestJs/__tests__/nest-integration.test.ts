import { Controller, Get, INestApplication, UseGuards } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';

import { createTestTokenFactory } from '../../Testing/createTestTokenFactory';
import { AccountAuthModule } from '../AccountAuthModule';
import { CurrentAccount } from '../Decorators/CurrentAccount';
import { AccountGuard } from '../Guards/AccountGuard';

@Controller()
class TestController {
    @Get('/guarded')
    @UseGuards(AccountGuard)
    public guarded(): { message: string } {
        return { message: 'ok' };
    }

    @Get('/guardedWithAccount')
    @UseGuards(AccountGuard)
    public guardedWithAccount(
        @CurrentAccount() account: unknown,
    ): unknown {
        return account;
    }

    @Get('/accountWithoutGuard')
    public accountWithoutGuard(
        @CurrentAccount() account: unknown,
    ): { message: string } {
        // This one should throw - we cannot get an account without Guard
        return { message: 'This should never be reached' };
    }
}

const jwtSecret = 'testKey-testKey-testKey-testKey1';
const createTestToken = createTestTokenFactory(jwtSecret);

describe('AuthModule Nest Integration Test', () => {
    const accountId = uuid();
    let app: INestApplication;
    let validJwtToken: string;

    beforeAll(async () => {
        validJwtToken = await createTestToken(accountId);

        const moduleRef = await Test.createTestingModule({
            imports: [AccountAuthModule.registerAsync({
                useFactory: () => ({ jwtSecret }),
            })],
            controllers: [TestController],
        })
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('Should return HTTP 403 if invalid token is provided', () => {
        const expected = {
            statusCode: 403,
            message: 'Could not verify the auth token',
            error: 'Forbidden',
        };

        return request(app.getHttpServer())
            .get('/guarded')
            .set('Authorization', 'Bearer invalid')
            .send()
            .expect(403)
            .expect(expected);
    });

    it('Should execute the controller if valid auth token is provided', () => {
        return request(app.getHttpServer())
            .get('/guarded')
            .set('Authorization', `Bearer ${validJwtToken}`)
            .send()
            .expect(200)
            .expect({
                message: 'ok',
            });
    });

    it('Should feed @CurrentAccount decorated properties with account payload', () => {
        return request(app.getHttpServer())
            .get('/guardedWithAccount')
            .set('Authorization', `Bearer ${validJwtToken}`)
            .send()
            .expect(200)
            .expect({
                accountId,
            });
    });

    it('Should throw if @CurrentAccount cannot find account in request context (missing Guard)', () => {
        return request(app.getHttpServer())
            .get('/accountWithoutGuard')
            .set('Authorization', `Bearer ${validJwtToken}`)
            .send()
            .expect(500)
            .expect({
                statusCode: 500,
                message: 'Internal server error',
            });
    });
});
