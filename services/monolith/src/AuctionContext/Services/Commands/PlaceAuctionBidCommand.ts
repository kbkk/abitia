import { createZodDto } from '@abitia/zod-dto';
import * as z from 'zod';

const placeAuctionBidCommandSchema = z.object({
    auctionId: z.string().uuid(),
    buyerId: z.string().uuid(),
    price: z.number(),
});

export class PlaceAuctionBidCommand extends createZodDto(placeAuctionBidCommandSchema) {}
