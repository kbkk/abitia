import { ZodValidationPipe } from '@abitia/zod-dto';
import { Body, Controller, Param, Post, UseGuards, UsePipes } from '@nestjs/common';

import { AccountGuard, CurrentAccount } from '../../Core/Auth';
import { TokenPayload } from '../../Core/Auth/types';
import { CreateAuctionCommand } from '../Services/Commands/CreateAuctionCommand';
import { PlaceAuctionBidCommand } from '../Services/Commands/PlaceAuctionBidCommand';
import { CreateAuctionService } from '../Services/CreateAuctionService';
import { PlaceAuctionBidService } from '../Services/PlaceAuctionBidService';

import { CreateAuctionDto } from './Dto/CreateAuctionDto';
import { PlaceAuctionBidDto } from './Dto/PlaceAuctionBidDto';

@Controller()
@UsePipes(ZodValidationPipe)
@UseGuards(AccountGuard)
export class AuctionController {
    public constructor(
        private readonly createAuctionService: CreateAuctionService,
        private readonly placeAuctionBidService: PlaceAuctionBidService,
    ) {
    }

    @Post('/auctions')
    public createAuction(
        @Body() dto: CreateAuctionDto,
        @CurrentAccount() account: TokenPayload,
    ): Promise<{id: string;}> {
        const command = CreateAuctionCommand.create({
            ...dto,
            sellerId: account.accountId,
        });
        const auction = this.createAuctionService.execute(command);

        return auction;
    }

    @Post('/auctions/:auctionId/bids')
    public async placeBid(
        @Param('auctionId') auctionId,
        @Body() dto: PlaceAuctionBidDto,
        @CurrentAccount() account: TokenPayload,
    ): Promise<{success: boolean;}> {
        const command = PlaceAuctionBidCommand.create({
            auctionId,
            buyerId: account.accountId,
            price: dto.price,
        });

        const result = await this.placeAuctionBidService.execute(command);

        return result;
    }
}
