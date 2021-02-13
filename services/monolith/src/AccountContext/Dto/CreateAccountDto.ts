import { createZodDto } from '@abitia/zod-dto';
import * as z from 'zod';


const createAccountDtoSchema = z.object({
    email: z.string().min(5),
    password: z.string().min(6),
});

export class CreateAccountDto extends createZodDto(createAccountDtoSchema) {}
