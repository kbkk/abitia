import { createZodDto } from '@abitia/zod-dto';
import * as z from 'zod';

const configDtoSchema = z.object({
    jwtSecretKey: z.string().min(32),
});

type ConfigProperties = z.infer<typeof configDtoSchema>

export class AccountContextConfig extends createZodDto(configDtoSchema) {
    /**
     * Use AccountContextConfig.create to instantiate
     * @private
     */
    private constructor() {
        super();
    }

    public static create(properties: ConfigProperties): AccountContextConfig {
        // Todo: Better error messages
        const parsedProperties = configDtoSchema.parse(properties);

        const config = Object.assign(
            new AccountContextConfig(),
            parsedProperties,
        );

        return config;
    }

    public static fromEnv(): AccountContextConfig {
        return AccountContextConfig.create({
            jwtSecretKey: process.env.ACCOUNT_JWT_SECRET_KEY!,
        });
    }
}
