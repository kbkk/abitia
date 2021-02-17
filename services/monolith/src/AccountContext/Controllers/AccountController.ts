import { ZodValidationPipe } from '@abitia/zod-dto';
import { Body, Controller, Get, Param, Post, Query, UsePipes } from '@nestjs/common';

import { CreateAccountDto } from '../Dto/CreateAccountDto';
import { ConfirmAccountService } from '../Services/ConfirmAccountService';
import { CreateAccountService } from '../Services/CreateAccountService';

@Controller()
@UsePipes(ZodValidationPipe)
export class AccountController {
    public constructor(
        private readonly createAccountService: CreateAccountService,
        private readonly confirmAccountService: ConfirmAccountService,
    ) {
    }

    @Post('/accounts')
    public async createAccount(
        @Body() dto: CreateAccountDto,
    ): Promise<{id: string; email: string;}> {
        const account = await this.createAccountService.execute(dto);

        // todo: standarize view models
        return {
            id: account.id,
            email: account.email,
        };
    }

    @Get('/accounts/:accountId/confirm')
    public async confirmAccountEmail(
        @Param('accountId') accountId,
        @Query('code') confirmationCode,
    ): Promise<{success: boolean}> {
        const result = await this.confirmAccountService.execute(accountId, confirmationCode);

        return result;
    }
}
