import { ZodDtoStatic } from '@abitia/zod-dto';
import { FastifyInstance } from 'fastify';

type DtoInstance = unknown;

export type RouteHandler<TBody extends DtoInstance, TQuery extends DtoInstance> =
    (input: { body: TBody, query: TQuery }) => void;

export interface RouteDefinition<TBody extends DtoInstance, TQuery extends DtoInstance> {
    path: string;
    method: 'get' | 'post' | 'all';
    body?: ZodDtoStatic<TBody>;
    query?: ZodDtoStatic<TQuery>;
    handler: RouteHandler<TBody, TQuery>;
}

export function createRoute<TBody extends DtoInstance,
    TQuery extends DtoInstance,
    >(def: RouteDefinition<TBody, TQuery>): RouteDefinition<TBody, TQuery> {
    return def;
}

type ValidationResult = {
    success: false;
    message: string;
} | {
    success: true;
    value: unknown;
}

function validateDto(dto: undefined | ZodDtoStatic<unknown>, value: unknown): ValidationResult {
    const zodSchema = dto?.zodSchema;

    if (zodSchema) {
        const parseResult = zodSchema.safeParse(value);

        if (!parseResult.success) {
            const { error } = parseResult;
            const message = error.errors
                .map(error => `${error.path.join('.')}: ${error.message}`)
                .join(', ');

            return { success: false, message: `Input validation failed: ${message}` };
        }

        return { success: true, value: parseResult.data };
    }

    return { success: true, value };
}

export function registerRoute(fastify: FastifyInstance, def: RouteDefinition<any, any>) {
    fastify[def.method](
        def.path,
        async (request, reply) => {
            const bodyValidationResult = validateDto(def.body, request.body);
            if (!bodyValidationResult.success) {
                await reply.status(422).send({
                    message: bodyValidationResult.message,
                });
                return;
            }

            const queryValidationResult = validateDto(def.body, request.body);
            if (!queryValidationResult.success) {
                await reply.status(422).send({
                    message: queryValidationResult.message,
                });
                return;
            }

            const bodyDto = bodyValidationResult.value;
            const queryDto = bodyValidationResult.value;

            return def.handler({
                body: bodyDto,
                query: queryDto,
            });
        },
    );
}
