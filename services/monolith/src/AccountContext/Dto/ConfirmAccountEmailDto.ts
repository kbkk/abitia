import { createZodDto } from '@abitia/zod-dto';
import * as z from 'zod';

const confirmAccountEmailQuerySchema = z.object({
    code: z.string().nonempty(),
});

export class ConfirmAccountEmailQueryDto extends createZodDto(confirmAccountEmailQuerySchema) {}
