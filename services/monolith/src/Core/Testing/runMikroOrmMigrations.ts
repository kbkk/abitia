import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';

export const runMikroOrmMigrations = async (app: INestApplication): Promise<void> => {
    const orm = app.get(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();
};
