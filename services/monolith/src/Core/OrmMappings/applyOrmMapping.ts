// eslint-disable-next-line @typescript-eslint/ban-types
import { Entity } from '@mikro-orm/core';

import { EntityMapping } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const applyOrmMapping = (entityMapping: EntityMapping<any>): void => {
    const { entity, mappings } = entityMapping;

    Entity()(entity);

    for(const mapping of mappings) {
        mapping.decorator(entity.prototype, mapping.key as string);
    }
};
