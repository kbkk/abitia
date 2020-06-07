import {Server, IncomingMessage, ServerResponse} from 'http';

import * as fastify from 'fastify';

type FastifyServer = fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>;

export function createServer(): FastifyServer {
    const server: FastifyServer = fastify({});

    server.get('/', async (request, reply) => {
        return {message: 'Hello!'};
    });

    return server;
}
