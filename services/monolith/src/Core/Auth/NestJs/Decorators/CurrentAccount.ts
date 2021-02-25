import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestWithAccount } from '../types';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CurrentAccount = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<RequestWithAccount>();
        const { account } = request;

        if(!account) {
            throw new Error('Could not find an Account in the request context. Did you register the Auth Guard?');
        }

        return account;
    },
);
