import { createZodDto } from '@abitia/zod-dto';
import * as z from 'zod';


const createAuctionDtoSchema = z.object({
    item: z.string().min(5), // Todo: This should be a reference to an Item, an item locking system should be designed
    price: z.number(), // Todo: int only
    type: z.enum(['buy-it-now', 'auctions'])
        .default('buy-it-now'),
});

export class CreateAuctionDto extends createZodDto(createAuctionDtoSchema) {}
