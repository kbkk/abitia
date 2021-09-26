import { FastifyInstance } from 'fastify';
import { Container } from 'inversify';

import { AccountController } from './AccountController';
import { AuthController } from './AuthController';

export function registerRoutes(fastify: FastifyInstance, container: Container) {
    const authController = container.get(AuthController);
    const accountController = container.get(AccountController);

    fastify.post('/accounts/me/tokens', authController.createAccount.bind(authController));

    fastify.post('/accounts', accountController.createAccount.bind(accountController));
    fastify.get('/accounts/:accountId/confirm', accountController.confirmAccountEmail.bind(accountController));
}
