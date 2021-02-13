import * as z from 'zod';

import { createZodDto } from '../../createZodDto';

const createAccountDtoSchema = z.object({
    email: z.string().min(5),
    password: z.string().min(6),
});

export class CreateAccountDto extends createZodDto(createAccountDtoSchema) {}
