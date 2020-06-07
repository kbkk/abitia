import * as fastify from 'fastify'
import {Server, IncomingMessage, ServerResponse} from 'http'

export function createServer() {
    const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({});

    server.get('/', async (request, reply) => {
        return {message: 'Hello!'};
    });

    return server;
}
