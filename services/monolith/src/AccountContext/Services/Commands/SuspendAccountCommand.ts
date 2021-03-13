import { createZodDto } from '@abitia/zod-dto';
import * as z from 'zod';

const suspendAccountCommandSchema = z.object({
    accountId: z.string().uuid(),
});

export class SuspendAccountCommand extends createZodDto(suspendAccountCommandSchema) {}
