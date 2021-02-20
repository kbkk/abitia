import { OpenApiBuilder } from '../openApiBuilder';
import { ZodTypeDefOpenApi } from '../zodTypeToOpenApi';

it('should attach provided properties to zod type def', () => {
    const builder = new OpenApiBuilder();

    const zodTypeWithOpenApiMetadata = builder
        .description('testDesc')
        .example('testExample')
        .format('testFormat')
        .type('testType')
        .zod()
        .string();

    const openApiMetadata = (zodTypeWithOpenApiMetadata._def as unknown as ZodTypeDefOpenApi).openApi;
    expect(openApiMetadata).toEqual({
        description: 'testDesc',
        example: 'testExample',
        format: 'testFormat',
        type: 'testType',
    });
});
