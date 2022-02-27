import { SignJWT } from 'jose';

export const createTestTokenFactory =
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    (jwtSecret:string) =>
        async (accountId: string): Promise<string> => {
            const key = Buffer.from(jwtSecret);
            const jwt = await new SignJWT({ 'accountId': accountId })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setIssuer('monolith:account-context')
                .setAudience('monolith:*')
                .setExpirationTime('12h')
                .sign(key);

            return jwt;
        };
