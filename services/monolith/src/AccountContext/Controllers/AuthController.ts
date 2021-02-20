import { ZodValidationPipe } from '@abitia/zod-dto';
import { Body, Controller, Post, UnauthorizedException, UsePipes } from '@nestjs/common';

import { CreateAuthTokenDto } from '../Dto/CreateAuthTokenDto';
import { CreateAuthTokenService } from '../Services/CreateAuthTokenService';

@Controller()
@UsePipes(ZodValidationPipe)
export class AuthController {
    public constructor(
        private readonly createAuthTokenService: CreateAuthTokenService,
    ) {
    }

    @Post('/accounts/me/tokens')
    public async createAccount(
        @Body() dto: CreateAuthTokenDto,
    ): Promise<{token: string;}> {
        const result = await this.createAuthTokenService.execute(dto);

        if(!result.success) {
            throw new UnauthorizedException(result.message);
        }

        return {
            token: result.token,
        };
    }
}
