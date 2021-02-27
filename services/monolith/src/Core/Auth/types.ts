import * as z from 'zod';

export interface AuthModuleConfig {
    jwtSecret: string;
}

export const tokenPayloadSchema = z.object({
    accountId: z.string().uuid(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
