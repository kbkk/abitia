/* istanbul ignore file */
import * as path from 'path';

import { config as configureDotenv } from 'dotenv';
import fastify from 'fastify';

import { AccountContextFactory } from './AccountContext/AccountContextFactory';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async function bootstrap() {
    const { error } = configureDotenv({ path: path.resolve(__dirname, '..', '.env') });
    if (error) {
        console.error('Failed to load the .env file');
        throw error;
    }

    const server = fastify();

    await server.register(async instance => {
        await AccountContextFactory.create({}, instance);
    }, {
        prefix: '/AccountContext',
    });


    await server.listen(3000);
})();
