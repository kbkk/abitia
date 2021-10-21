import { Provider } from '@nestjs/common';
import { Container } from 'inversify';

export function adapt(container: Container, nestProviders: Provider | Provider[]): void {
    if(!Array.isArray(nestProviders)){
        nestProviders = [nestProviders];
    }

    for(const provider of nestProviders) {
        if('provide' in provider) {
            if('useValue' in provider) {
                container.bind(provider.provide).toConstantValue(provider.useValue);
            }
            else if('useFactory' in provider) {
                container.bind(provider.provide).toDynamicValue((context => {
                    const { container } = context;

                    const params = (provider.inject ?? [])
                        .map(injectToken => container.get(injectToken));

                    return provider.useFactory(...params);
                })).inSingletonScope();
            } else {
                throw new Error('Nest.js provider could not be adapted to Inversify.');
            }

        } else {
            throw new Error('Nest.js provider could not be adapted to Inversify.');
        }

    }
}
