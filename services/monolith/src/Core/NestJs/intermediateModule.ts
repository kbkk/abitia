import { DynamicModule, Provider, Type, ClassProvider } from '@nestjs/common';

const getProviderName = (provider: Provider): string => {
    const provide = (provider as ClassProvider).provide;

    if (typeof provide === 'string') {
        return provide;
    }

    if(typeof provide === 'symbol') {
        return provide.toString();
    }

    return provide.name;
};

const dynamicCtor = (name: string): Type => {
    const ctor = class {};
    Object.defineProperty(ctor, 'name', { value: name });

    return ctor;
};

let uniqueId = 0;

export const intermediateModule = (providers: Provider | Provider[], imports: DynamicModule | DynamicModule[] = []): DynamicModule => {
    if(!Array.isArray(providers)){
        providers = [providers];
    }
    if(!Array.isArray(imports)){
        imports = [imports];
    }
    const moduleName = providers.map(getProviderName).join('-') + '-IntermediateModule' + (++uniqueId);
    const ctor = dynamicCtor(moduleName);
    return {
        module: ctor,
        global: true,
        imports,
        providers: providers,
        exports: providers,
    };
};
