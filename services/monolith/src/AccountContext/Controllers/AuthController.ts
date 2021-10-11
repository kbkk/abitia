import { UnauthorizedException } from '@nestjs/common';

import { createRoute } from '../../Core/Http';
import { withInject } from '../../Core/Inversify/Inject';
import { CreateAuthTokenDto } from '../Dto/CreateAuthTokenDto';
import { CreateAuthTokenService } from '../Services/CreateAuthTokenService';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createAuthTokenController = createRoute({
    path: '/accounts/me/tokens',
    method: 'post',
    body: CreateAuthTokenDto,
    handler: withInject(CreateAuthTokenService)(createAuthTokenService =>
        async ({ body }) => {
            const result = await createAuthTokenService.execute(body);

            if (!result.success) {
                throw new UnauthorizedException(result.message);
            }

            return {
                token: result.token,
            };
        }),
});
