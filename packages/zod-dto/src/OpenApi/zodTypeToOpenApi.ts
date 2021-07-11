import {
    ZodArray, ZodBigInt, ZodBoolean, ZodDefault,
    ZodEnum,
    ZodLiteral,
    ZodNullable, ZodNumber,
    ZodObject,
    ZodOptional, ZodString,
    ZodTransformer, ZodTuple,
    ZodTypeAny,
    ZodTypeDef,
    ZodUnion,
} from 'zod';

import { OpenApiBuilderProperties } from './types';

export interface OpenApiElement {
    [key: string]: unknown;
    type: string;
}

export interface ZodTypeDefOpenApi extends ZodTypeDef {
    openApi: OpenApiBuilderProperties;
}

export const zodTypeToOpenApi = (zodType: ZodTypeAny): OpenApiElement => {
    const zodDef = zodType._def;

    const openApiElement = (element: OpenApiElement): OpenApiElement => {
        return {
            required: true,
            ...element,
            ...(zodDef as ZodTypeDefOpenApi).openApi,
        };
    };

    switch(zodType.constructor.name) {
    case ZodObject.name: {
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
    case ZodDefault.name:
    case ZodOptional.name: {
        return openApiElement({
            ...zodTypeToOpenApi(zodDef.innerType),
            required: false,
        });
    }
    case ZodNullable.name: {
        return openApiElement({
            ...zodTypeToOpenApi(zodDef.innerType),
            nullable: true,
        });
    }
    case ZodTransformer.name: {
        return openApiElement({
            ...zodTypeToOpenApi(zodDef.schema),
        });
    }
    case ZodEnum.name: {
        const enumValues = zodDef.values;

        return openApiElement({
            type: 'string',
            enum: enumValues,
        });
    }
    case ZodLiteral.name: {
        const { value } = zodDef;

        return openApiElement({
            type: 'string',
            enum: [value],
        });
    }
    case ZodUnion.name: {
        const { options } = zodDef;

        return openApiElement({
            oneOf: options.map(item => zodTypeToOpenApi(item)),
        } as unknown as OpenApiElement);
    }
    case ZodTuple.name: {
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
    case ZodArray.name: {
        const { type } = zodDef;

        const items = type ? zodTypeToOpenApi(type) : {};

        return openApiElement({
            type: 'array',
            items,
        });
    }
    case ZodBigInt.name: {
        return openApiElement({
            type: 'integer',
            format: 'int64',
        });
    }
    case ZodString.name: {
        return openApiElement({
            type: 'string',
        });
    }
    case ZodNumber.name: {
        return openApiElement({
            type: 'number',
        });
    }
    case ZodBoolean.name: {
        return openApiElement({
            type: 'boolean',
        });
    }
    default: {
        return openApiElement({
            type: 'string',
        });
    }
    }
};
