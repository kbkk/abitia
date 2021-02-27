import { createZodDto } from '@abitia/zod-dto';
import * as z from 'zod';

const createAuctionCommandSchema = z.object({
    item: z.string().min(5),
    price: z.number().int(),
    type: z.enum(['buy-it-now', 'auctions']),
    sellerId: z.string().uuid(),
});

export class CreateAuctionCommand extends createZodDto(createAuctionCommandSchema) {}
