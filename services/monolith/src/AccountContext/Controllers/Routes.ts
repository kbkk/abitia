import { FastifyInstance } from 'fastify';
import { Container } from 'inversify';

import { registerRoute } from '../../Core/Http';

import { confirmAccountController, createAccountController } from './AccountController';
import { createAuthTokenController } from './AuthController';

export function registerRoutes(fastify: FastifyInstance, container: Container): void {
    registerRoute(fastify, container, createAuthTokenController);
    registerRoute(fastify, container, createAccountController);
    registerRoute(fastify, container, confirmAccountController);
}
