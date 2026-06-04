import * as path from 'path';

import { zodTypeToOpenApi } from './zodTypeToOpenApi';

function loadSchemaObjectFactory() {
    const swaggerDir = path.dirname(require.resolve('@nestjs/swagger/package.json'));
    return require(path.join(swaggerDir, 'dist', 'services', 'schema-object-factory'));
}

export const patchNestjsSwagger = (
    schemaObjectFactoryModule = loadSchemaObjectFactory(),
): void => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/naming-convention
    const { SchemaObjectFactory } = schemaObjectFactoryModule;

    const orgExploreModelSchema = SchemaObjectFactory.prototype.exploreModelSchema;

    SchemaObjectFactory.prototype.exploreModelSchema = function(type: any, schemas: any, schemaRefsStack: any) {
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
