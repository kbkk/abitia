import { zodTypeToOpenApi } from './zodTypeToOpenApi';

export const patchNestjsSwagger = (
    schemaObjectFactoryModule = require('@nestjs/swagger/dist/services/schema-object-factory'),
): void => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/naming-convention
    const { SchemaObjectFactory } = schemaObjectFactoryModule;

    const orgExploreModelSchema = SchemaObjectFactory.prototype.exploreModelSchema;

    SchemaObjectFactory.prototype.exploreModelSchema = function(type, schemas, schemaRefsStack) {
        if (this.isLazyTypeFunc(type)) {
            // eslint-disable-next-line @typescript-eslint/ban-types
            type = (type as Function)();
        }

        if(!type.zodSchema) {
            return orgExploreModelSchema(type, schemas, schemaRefsStack);
        }

        const openApiDef = zodTypeToOpenApi(type.zodSchema);

        schemas[type.name] = openApiDef;

        return type.name;
    };
    SchemaObjectFactory.prototype.__zodDtoPatched = true;
};
