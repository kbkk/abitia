import { PrimaryKey, Property, TimeType } from '@mikro-orm/core';

import { EntityMapping } from '../../../Core/OrmMappings';
import { Auction } from '../Auction';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AuctionMapping: EntityMapping<Auction> = {
    entity: Auction,
    mappings: [
        {
            key: 'id',
            decorator: PrimaryKey({ type: 'string' }),
        },
        {
            key: 'item',
            decorator: Property({ type: 'string' }),
        },
        {
            key: 'price',
            decorator: Property({ type: 'number' }),
        },
        {
            key: 'type',
            decorator: Property({ type: 'string' }),
        },
        {
            key: 'seller',
            decorator: Property({ type: 'string' }),
        },
        {
            key: 'createdAt',
            decorator: Property({ type: TimeType }),
        },
    ],
};
