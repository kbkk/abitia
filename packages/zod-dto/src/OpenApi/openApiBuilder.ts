import * as z from 'zod';

import { OpenApiBuilderProperties } from './types';
import { ZodTypeDefOpenApi } from './zodTypeToOpenApi';

type OpenApiBuilderMethods = {
    [K in keyof OpenApiBuilderProperties]-?: (val: OpenApiBuilderProperties[K]) => OpenApiBuilder
}

export class OpenApiBuilder implements OpenApiBuilderMethods {
    private _def: OpenApiBuilderProperties = {};

    public example = this.createPropertyHandler('example');
    public description = this.createPropertyHandler('description');
    public format = this.createPropertyHandler('format');
    public type = this.createPropertyHandler('type');

    private createPropertyHandler(prop: keyof OpenApiBuilderMethods): (val) => this {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (val: any) => {
            this._def[prop] = val;
            return this;
        };
    }

    public zod(): typeof z {
        const _def = this._def;

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        const enrichZodSchemaWithOpenApi = (fn) => (...args) => {
            const result = fn(...args);
            if(result instanceof z.ZodType) {
                (result._def as ZodTypeDefOpenApi).openApi = _def;
            }
            return result;
        };

        const proxyHandler = {
            get(target, name) {
                const val = target[name];

                if(typeof val !== 'function') {
                    return val;
                }

                return enrichZodSchemaWithOpenApi(val);
            },
        };

        return new Proxy(z, proxyHandler);
    }
}

export const buildOpenApi = (): OpenApiBuilder => {
    return new OpenApiBuilder();
};
