import { Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { injectable } from 'inversify';

import * as E from '../../Core/Fp/Either';
import { ConfirmAccountEmailQueryDto } from '../Dto/ConfirmAccountEmailDto';
import { CreateAccountDto } from '../Dto/CreateAccountDto';
import { ConfirmAccountService } from '../Services/ConfirmAccountService';
import { CreateAccountService } from '../Services/CreateAccountService';

@injectable()
export class AccountController {
    public constructor(
        private readonly createAccountService: CreateAccountService,
        private readonly confirmAccountService: ConfirmAccountService,
    ) {
    }

    @Post('/accounts')
    public async createAccount(
        request: FastifyRequest,
    ): Promise<{ id: string; email: string; }> {
        const dto = CreateAccountDto.create(request.body);
        const result = await this.createAccountService.execute(dto);

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
    }

    @Get('/accounts/:accountId/confirm')
    public async confirmAccountEmail(
        request: FastifyRequest,
    ): Promise<{ success: boolean }> {
        const { accountId } = request.params as any;
        const { code } = ConfirmAccountEmailQueryDto.create(request.query);

        const result = await this.confirmAccountService.execute(accountId, code);

        return result;
    }
}
