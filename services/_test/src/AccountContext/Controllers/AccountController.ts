import {Body, Controller, Get, Post, UsePipes} from "@nestjs/common";

import {ZodValidationPipe} from "../../ZodValidationPipe";
import {CreateAccountDto} from "../Dto/CreateAccountDto";

@Controller()
@UsePipes(ZodValidationPipe)
export class AppController {
    @Post('/accounts')
    public createAccount(
        @Body() dto: CreateAccountDto
    ): string {
        return 'Hello world';
    }

    @Get()
    public getHello(): string {
        return 'Hello world';
    }
}
