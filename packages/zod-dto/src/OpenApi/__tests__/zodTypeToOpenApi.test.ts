import * as z from 'zod';
import { ZodTypeAny } from 'zod';

import { zodTypeToOpenApi } from '../zodTypeToOpenApi';

const testTuple = z.tuple([
    z.string(),
    z.object({ name: z.literal('Rudy') }),
    z.array(
        z.union([
            z.literal('blue'),
            z.literal('red'),
        ]),
    )]);

const complexTestSchema = z.object({
    item: z.string().min(5),
    price: z.number(),
    type: z.enum(['buy-it-now', 'auctions'])
        .default('buy-it-now'),
    testTuple,
    kekity: z.union([z.literal('kek'), z.literal('topkek')]),
    arr: z.array(z.string()).max(3),
    obj: z.object({
        uuid: z.string().uuid(),
    }),
});

it('should serialize a complex schema', () => {
    const openApiObject = zodTypeToOpenApi(complexTestSchema);

    expect(openApiObject).toMatchSnapshot();
});

it('should serialize objects', () => {
    const schema = z.object({
        prop1: z.string(),
    });
    const openApiObject = zodTypeToOpenApi(schema);

    expect(openApiObject).toEqual({
        type: 'object',
        required: true,
        properties:  {
            prop1:  {
                type: 'string',
                required: true,
            },
        },
    });
});

it('should serialize nullable types', () => {
    const schema = z.string().nullable();
    const openApiObject = zodTypeToOpenApi(schema);

    expect(openApiObject).toEqual({
        type: 'string',
        required: true,
        nullable: true,
    });
});

it('should serialize optional types', () => {
    const schema = z.string().optional();
    const openApiObject = zodTypeToOpenApi(schema);

    expect(openApiObject).toEqual({
        type: 'string',
        required: false,
    });
});

it('should serialize types with default value', () => {
    const schema = z.string().default('abitia');
    const openApiObject = zodTypeToOpenApi(schema);

    expect(openApiObject).toEqual({
        type: 'string',
        required: false,
    });
});

it('should serialize enums', () => {
    const schema = z.enum(['adama', 'kota']);
    const openApiObject = zodTypeToOpenApi(schema);

    expect(openApiObject).toEqual({
        type: 'string',
        required: true,
        enum: ['adama', 'kota'],
    });
});

describe('scalar types', () => {
    const testCases: [ZodTypeAny, string, string?][] = [
        // [zod type, expected open api type, expected format]
        [z.string(), 'string'],
        [z.number(), 'number'],
        [z.boolean(), 'boolean'],
        [z.bigint(), 'integer', 'int64'],
        // [z.null(), 'null'], <- Needs OpenApi 3.1 to be represented correctly
        // [z.undefined(), 'undefined'], <- TBD, probably the property should be removed from schema
    ];

    for(const [zodType, expectedType, expectedFormat] of testCases) {
        it(expectedType, () => {
            const openApiObject = zodTypeToOpenApi(zodType);

            expect(openApiObject).toEqual({
                type: expectedType,
                required: true,
                format: expectedFormat ?? undefined,
            });
        });
    }
});
