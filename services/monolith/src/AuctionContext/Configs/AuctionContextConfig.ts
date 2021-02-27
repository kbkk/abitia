import { createZodDto } from '@abitia/zod-dto';
import * as z from 'zod';

const configDtoSchema = z.object({
    jwtSecretKey: z.string().min(32),
});

type ConfigProperties = z.infer<typeof configDtoSchema>

export class AuctionContextConfig extends createZodDto(configDtoSchema) {
    /**
     * Use AuctionContextConfig.create to instantiate
     * @private
     */
    private constructor() {
        super();
    }

    public static create(properties: ConfigProperties): AuctionContextConfig {
        const parsedProperties = configDtoSchema.parse(properties);

        const config = Object.assign(
            new AuctionContextConfig(),
            parsedProperties,
        );

        return config;
    }

    public static fromEnv(): AuctionContextConfig {
        return AuctionContextConfig.create({
            jwtSecretKey: process.env.JWT_SECRET_KEY!,
        });
    }
}
