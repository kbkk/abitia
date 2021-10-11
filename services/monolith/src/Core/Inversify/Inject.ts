import { Container } from 'inversify';
import { interfaces } from 'inversify/lib/interfaces/interfaces';

type ExtractGeneric<Type> = Type extends interfaces.ServiceIdentifier<infer X> ? X : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withInject = <T extends interfaces.ServiceIdentifier<any>>(...serviceIdentifiers: T[]): (callback: (...args: ExtractGeneric<T>[]) => any) => any => {
    return (callback) => {
        return (container: Container) => {
            const injectables = serviceIdentifiers.map(svc => container.get(svc));
            return callback(...injectables as ExtractGeneric<T>[]);
        };
    };
};
