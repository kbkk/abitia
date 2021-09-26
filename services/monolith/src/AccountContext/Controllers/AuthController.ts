import { UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { injectable } from 'inversify';

import { CreateAuthTokenDto } from '../Dto/CreateAuthTokenDto';
import { CreateAuthTokenService } from '../Services/CreateAuthTokenService';

@injectable()
export class AuthController {
    public constructor(
        private readonly createAuthTokenService: CreateAuthTokenService,
    ) {
    }

    public async createAccount(
        request: FastifyRequest,
        // @Body() dto: CreateAuthTokenDto,
    ): Promise<{ token: string; }> {
        const dto = CreateAuthTokenDto.create(request.body);
        const result = await this.createAuthTokenService.execute(dto);

        if (!result.success) {
            throw new UnauthorizedException(result.message);
        }

        return {
            token: result.token,
        };
    }
}
