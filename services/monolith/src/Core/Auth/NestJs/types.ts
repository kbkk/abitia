import { Request } from 'express';

import { TokenPayload } from '../types';

export type RequestWithAccount = Request & {
    account: TokenPayload,
}
