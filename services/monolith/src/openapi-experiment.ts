import * as z from 'zod';
import { ZodTypes } from 'zod';
import { ZodArrayDef } from 'zod/lib/cjs/types/array';
import { ZodEnumDef } from 'zod/lib/cjs/types/enum';
import { ZodLiteralDef } from 'zod/lib/cjs/types/literal';
import { ZodNullableDef } from 'zod/lib/cjs/types/nullable';
import { ZodOptionalDef } from 'zod/lib/cjs/types/optional';
import { ZodTransformerDef } from 'zod/lib/cjs/types/transformer';
import { ZodTupleDef } from 'zod/lib/cjs/types/tuple';
import { ZodUnionDef } from 'zod/lib/cjs/types/union';

const { SchemaObjectFactory } = require('@nestjs/swagger/dist/services/schema-object-factory');

interface OpenApiElement {
    [key: string]: unknown;
    type: string;
}

const zodTypeToOpenApi = (zodType: z.ZodType<any>): OpenApiElement => {
    const zodDef = zodType._def;

    const openApiElement = (element: OpenApiElement): OpenApiElement => {
        return {
            ...element,
            ...(zodDef as any).openApi,
        };
    };

    const serializers = {
        [ZodTypes.object]: () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const shape: Record<string, z.ZodType<unknown>> = (zodType as z.ZodObject<any>).shape;
            const properties = {};

            for(const shapeKey in shape) {
                const propZodType = shape[shapeKey];

                const openApiDef = zodTypeToOpenApi(propZodType);
                properties[shapeKey] = openApiDef;
            }

            return openApiElement({
                type: 'object',
                properties,
            });
        },
        [ZodTypes.optional]: () => {
            return openApiElement({
                ...zodTypeToOpenApi((zodDef as ZodOptionalDef).innerType),
                required: false,
            });
        },
        [ZodTypes.nullable]: () => {
            return openApiElement({
                ...zodTypeToOpenApi((zodDef as ZodNullableDef).innerType),
                nullable: true,
            });
        },
        [ZodTypes.transformer]: () => {
            return openApiElement({
                ...zodTypeToOpenApi((zodDef as ZodTransformerDef).schema),
            });
        },
        [ZodTypes.enum]: () => {
            const enumValues = (zodDef as ZodEnumDef).values;

            return openApiElement({
                type: 'string',
                enum: enumValues,
            });
        },
        [ZodTypes.literal]: () => {
            const { value } = (zodDef as ZodLiteralDef);

            return openApiElement({
                type: 'string',
                enum: [value],
            });
        },
        [ZodTypes.union]: () => {
            const { options } = (zodDef as ZodUnionDef);

            return openApiElement({
                oneOf: options.map(item => zodTypeToOpenApi(item)),
            } as unknown as OpenApiElement);
        },
        [ZodTypes.tuple]: () => {
            // Switch to OpenAPI 3.1 once supported by swagger ui https://stackoverflow.com/questions/57464633/

            const { items } = (zodDef as ZodTupleDef);

            return openApiElement({
                type: 'array',
                items: {
                    oneOf: items.map(item => zodTypeToOpenApi(item)),
                },
                minItems: items.length,
                maxItems: items.length,
            });
        },
        [ZodTypes.array]: () => {
            // Switch to OpenAPI 3.1 once supported by swagger ui https://stackoverflow.com/questions/57464633/

            const { type } = (zodDef as ZodArrayDef);
            console.log(zodDef);

            let items = {};

            if(type) {
                items = zodTypeToOpenApi(type);
            }

            return openApiElement({
                type: 'array',
                items,
            });
        },
        'default': () => {
            return openApiElement({
                type: zodDef.t,
            });
        },
    };

    return (serializers[zodDef.t] || serializers.default)();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const zodToOpenApi = (z: z.ZodObject<any>) => {
    if(z._def.t !== ZodTypes.object) {
        throw new Error('Expected a ZodObject');
    }

    return zodTypeToOpenApi(z);
};

class OpenApiProperty {
    private _def: {
        example?: unknown;
        description?: string;
    } = {};

    public example(example: unknown): this {
        this._def.example = example;

        return this;
    }

    public description(example: string): this {
        this._def.description = example;

        return this;
    }

    public zod(): typeof z {
        const _def = this._def;
        return new Proxy(z, {
            get(target, name) {
                const val = target[name];

                if(typeof val !== 'function') {
                    return val;
                }

                return (...args) => {
                    const result = val(...args);
                    if(result instanceof z.ZodType) {
                        (result._def as any).openApi = _def;
                    }
                    return result;
                };
            },
        });
    }
}

export const buildOpenApi = () => {
    return new OpenApiProperty();
};

const orgExploreModelSchema = SchemaObjectFactory.prototype.exploreModelSchema;

SchemaObjectFactory.prototype.exploreModelSchema = function(type, schemas, schemaRefsStack) {
    if (this.isLazyTypeFunc(type)) {
        // eslint-disable-next-line @typescript-eslint/ban-types
        type = (type as Function)();
    }

    if(!type.zodSchema) {
        return orgExploreModelSchema(type, schemas, schemaRefsStack);
    }

    const openApiDef = zodToOpenApi(type.zodSchema);

    schemas.push({
        [type.name]: openApiDef,
    });

    return type.name;
};
