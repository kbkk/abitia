import { Get, HttpException, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { injectable } from 'inversify';

import * as E from '../../Core/Fp/Either';
import { createRoute } from '../../Core/Http';
import { withInject } from '../../Core/Inversify/Inject';
import { ConfirmAccountEmailQueryDto } from '../Dto/ConfirmAccountEmailDto';
import { CreateAccountDto } from '../Dto/CreateAccountDto';
import { CreateAuthTokenDto } from '../Dto/CreateAuthTokenDto';
import { ConfirmAccountService } from '../Services/ConfirmAccountService';
import { CreateAccountService } from '../Services/CreateAccountService';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createAccountController = createRoute({
    path: '/accounts',
    method: 'post',
    body: CreateAuthTokenDto,
    handler: withInject(CreateAccountService)(createAccountService =>
        async ({ body, reply }) => {
            reply.code(201);
            const dto = CreateAccountDto.create(body);
            const result = await createAccountService.execute(dto);

            return E.match(
                result,
                (error) => {
                    throw new HttpException(
                        error.message,
                        HttpStatus.CONFLICT,
                    );
                },
                (account) => {
                    return {
                        id: account.id,
                        email: account.email,
                    };
                },
            );
        }),
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const confirmAccountController = createRoute({
    path: '/accounts/:accountId/confirm',
    method: 'get',
    query: ConfirmAccountEmailQueryDto,
    handler: withInject(ConfirmAccountService)(confirmAccountService =>
        async ({ params, query }) => {
            const { accountId } = params;
            const { code } = query;

            const result = await confirmAccountService.execute(accountId, code);

            return result;
        }),
});
