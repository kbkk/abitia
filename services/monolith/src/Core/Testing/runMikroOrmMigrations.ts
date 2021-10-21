import { MikroORM } from '@mikro-orm/core';
import { interfaces } from 'inversify';

import Container = interfaces.Container;

export const runMikroOrmMigrations = async (container: Container): Promise<void> => {
    const orm = container.get(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();
};
