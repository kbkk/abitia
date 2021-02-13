import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import * as z from 'zod';

import { ZodValidationPipe } from './ZodValidationPipe';
import { createZodDto } from './createZodDto';

const helloWorldDtoSchema = z.object({
    hello: z.string()
});

class HelloWorldDto extends createZodDto(helloWorldDtoSchema) {}

@Controller()
export class AppController {
    @Post()
    @UsePipes(ZodValidationPipe)
    public postHello(
        @Body() dto: HelloWorldDto
    ): string {
        console.log(dto.hello);
        return 'Hello world';
    }

    @Get()
    public getHello(): string {
        return 'Hello world';
    }
}
