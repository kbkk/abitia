import { ZodValidationPipe } from '@abitia/zod-dto';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';

import { CreateAuctionDto } from '../Dto/CreateAuctionDto';
import { CreateAuctionService } from '../Services/CreateAuctionService';

@Controller()
@UsePipes(ZodValidationPipe)
export class AuctionController {
    public constructor(
        private readonly createAuctionService: CreateAuctionService
    ) {
    }

    @Post('/auctions')
    public createAuction(
        @Body() dto: CreateAuctionDto
    ): Promise<{id: string;}> {
        const auction = this.createAuctionService.execute(dto);

        return auction;
    }
}
