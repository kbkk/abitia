import { Request } from 'express';

import { TokenPayload } from '../../../AccountContext';

export type RequestWithAccount = Request & {
    account: TokenPayload,
}
