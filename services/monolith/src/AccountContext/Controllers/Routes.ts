import { FastifyInstance } from 'fastify';
import { Container } from 'inversify';

import { registerRoute } from '../../Core/Http';

import { AccountController } from './AccountController';
import { createAuthTokenController } from './TestController';

export function registerRoutes(fastify: FastifyInstance, container: Container) {
    const accountController = container.get(AccountController);

    // fastify.post('/accounts/me/tokenss', authController.createAccount.bind(authController));
    registerRoute(fastify, createAuthTokenController(container));

    fastify.post('/accounts', accountController.createAccount.bind(accountController));
    fastify.get('/accounts/:accountId/confirm', accountController.confirmAccountEmail.bind(accountController));
}
