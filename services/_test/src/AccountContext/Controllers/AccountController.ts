import {Body, Controller, Post, UsePipes} from "@nestjs/common";

import {ZodValidationPipe} from "../../ZodValidationPipe";
import {CreateAccountDto} from "../Dto/CreateAccountDto";
import {CreateAccountService} from "../Services/CreateAccountService";

@Controller()
@UsePipes(ZodValidationPipe)
export class AccountController {
    public constructor(
        private readonly createAccountService: CreateAccountService
    ) {
    }

    @Post('/accounts')
    public createAccount(
        @Body() dto: CreateAccountDto
    ): Promise<{id: string; email: string, password: string}> {
        const account = this.createAccountService.execute(dto);

        return account;
    }
}
