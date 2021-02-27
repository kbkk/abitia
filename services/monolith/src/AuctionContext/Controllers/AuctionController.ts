import { ZodValidationPipe } from '@abitia/zod-dto';
import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';

import { AccountGuard, CurrentAccount } from '../../Core/Auth';
import { TokenPayload } from '../../Core/Auth/types';
import { CreateAuctionCommand } from '../Services/Commands/CreateAuctionCommand';
import { CreateAuctionService } from '../Services/CreateAuctionService';

import { CreateAuctionDto } from './Dto/CreateAuctionDto';

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
        const command = CreateAuctionCommand.create({
            ...dto,
            sellerId: account.accountId,
        });
        const auction = this.createAuctionService.execute(command);

        return auction;
    }
}
