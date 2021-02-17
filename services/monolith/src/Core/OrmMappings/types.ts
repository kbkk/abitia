import type { AnyEntity } from '@mikro-orm/core';

// eslint-disable-next-line @typescript-eslint/ban-types
type Constructor<T> = Function & { prototype: T };
type Decorator = (target: AnyEntity, propertyName: string) => unknown;
export type PropertyMapping<TEntity> = {key: keyof TEntity, decorator: Decorator}

export type EntityMapping<TEntity> = {
    entity: Constructor<TEntity>;
    mappings: PropertyMapping<TEntity>[];
}
