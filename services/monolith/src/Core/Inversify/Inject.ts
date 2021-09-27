import { Container } from 'inversify';
import { interfaces } from 'inversify/lib/interfaces/interfaces';

type ExtractGeneric<Type> = Type extends interfaces.ServiceIdentifier<infer X> ? X : never

export const withInject = <T extends interfaces.ServiceIdentifier<any>>(container: Container, ...serviceIdentifiers: T[]): (callback: (...args: ExtractGeneric<T>[]) => any) => any => {
    const injectables = serviceIdentifiers.map(svc => container.get(svc));

    return (callback) => {
        return callback(...injectables as ExtractGeneric<T>[]);
    };
};
