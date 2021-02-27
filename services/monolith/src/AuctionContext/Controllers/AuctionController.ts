import { ZodValidationPipe } from '@abitia/zod-dto';
import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';

import { TokenPayload } from '../../AccountContext';
import { AccountGuard, CurrentAccount } from '../../Core/Auth';
import { CreateAuctionDto } from '../Dto/CreateAuctionDto';
import { CreateAuctionService } from '../Services/CreateAuctionService';

@Controller()
@UsePipes(ZodValidationPipe)
@UseGuards(AccountGuard)
export class AuctionController {
    public constructor(
        private readonly createAuctionService: CreateAuctionService,
    ) {
    }

    @Post('/auctions')
    public createAuction(
        @Body() dto: CreateAuctionDto,
        @CurrentAccount() account: TokenPayload,
    ): Promise<{id: string;}> {
        const auction = this.createAuctionService.execute(dto);

        return auction;
    }
}
