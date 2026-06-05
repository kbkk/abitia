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

/**
 * Define a provider once, inject it anywhere — no module imports needed.
 *
 * NestJS scopes providers to their module by default. This utility bypasses that
 * by wrapping providers in a global dynamic module, giving you a flat IoC container
 * similar to Spring's.
 *
 * @example
 * // Register a provider globally
 * @Module({
 *   imports: [provideGlobally(LoggerService)],
 * })
 * class AppModule {}
 *
 * // Inject it anywhere (inside a different module) without importing the defining module
 * @Injectable()
 * class OrderService {
 *   constructor(private readonly logger: LoggerService) {}
 * }
 *
 * @Module({
 *   // No need to import the module that provides LoggerService!
 *   providers: [OrderService],
 * })
 * class OrderModule {}
 *
 * @example
 * // Multiple providers with imports
 * provideGlobally(
 *   [UserRepository, OrderRepository],
 *   [DatabaseModule.forRoot()], // optional imports for the providers
 * )
 */
export const provideGlobally = (
    providers: Provider | Provider[],
    imports: DynamicModule | DynamicModule[] = [],
): DynamicModule => {
    if(!Array.isArray(providers)){
        providers = [providers];
    }
    if(!Array.isArray(imports)){
        imports = [imports];
    }
    const moduleName = providers.map(getProviderName).join('-') + '-GlobalModule' + (++uniqueId);
    const ctor = dynamicCtor(moduleName);
    return {
        module: ctor,
        global: true,
        imports,
        providers: providers,
        exports: providers,
    };
};
