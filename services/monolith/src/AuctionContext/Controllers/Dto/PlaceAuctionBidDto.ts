import { createZodDto } from '@abitia/zod-dto';
import * as z from 'zod';

const placeAuctionBidDtoSchema = z.object({
    price: z.number().int(),
});

export class PlaceAuctionBidDto extends createZodDto(placeAuctionBidDtoSchema) {}
