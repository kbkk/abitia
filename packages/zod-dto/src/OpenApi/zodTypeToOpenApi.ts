import { ZodDef, ZodTypeAny, ZodTypeDef, ZodTypes } from 'zod';

import { OpenApiBuilderProperties } from './types';

export interface OpenApiElement {
    [key: string]: unknown;
    type: string;
}

export interface ZodTypeDefOpenApi extends ZodTypeDef {
    openApi: OpenApiBuilderProperties;
}

export const zodTypeToOpenApi = (zodType: ZodTypeAny): OpenApiElement => {
    const zodDef = zodType._def as ZodDef;

    const openApiElement = (element: OpenApiElement): OpenApiElement => {
        return {
            required: true,
            ...element,
            ...(zodDef as ZodTypeDefOpenApi).openApi,
        };
    };

    switch(zodDef.t) {
    case ZodTypes.object: {
        const shape = zodDef.shape();
        const shapeKeys = Object.keys(shape);
        const properties = {};

        for (const key of shapeKeys) {
            const propZodType = shape[key];

            properties[key] = zodTypeToOpenApi(propZodType);
        }

        return openApiElement({
            type: 'object',
            properties,
        });
    }
    case ZodTypes.optional: {
        return openApiElement({
            ...zodTypeToOpenApi(zodDef.innerType),
            required: false,
        });
    }
    case ZodTypes.nullable: {
        return openApiElement({
            ...zodTypeToOpenApi(zodDef.innerType),
            nullable: true,
        });
    }
    case ZodTypes.transformer: {
        return openApiElement({
            ...zodTypeToOpenApi(zodDef.schema),
        });
    }
    case ZodTypes.enum: {
        const enumValues = zodDef.values;

        return openApiElement({
            type: 'string',
            enum: enumValues,
        });
    }
    case ZodTypes.literal: {
        const { value } = zodDef;

        return openApiElement({
            type: 'string',
            enum: [value],
        });
    }
    case ZodTypes.union: {
        const { options } = zodDef;

        return openApiElement({
            oneOf: options.map(item => zodTypeToOpenApi(item)),
        } as unknown as OpenApiElement);
    }
    case ZodTypes.tuple: {
        // Switch to OpenAPI 3.1 once supported by swagger ui https://stackoverflow.com/questions/57464633/

        const { items } = zodDef;

        return openApiElement({
            type: 'array',
            items: {
                oneOf: items.map(item => zodTypeToOpenApi(item)),
            },
            minItems: items.length,
            maxItems: items.length,
        });
    }
    case ZodTypes.array: {
        const { type } = zodDef;

        const items = type ? zodTypeToOpenApi(type) : {};

        return openApiElement({
            type: 'array',
            items,
        });
    }
    case ZodTypes.bigint: {
        return openApiElement({
            type: 'integer',
            format: 'int64',
        });
    }
    default: {
        return openApiElement({
            type: zodDef.t,
        });
    }
    }
};
