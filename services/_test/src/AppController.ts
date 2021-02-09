import {Body, Controller, Get, Post, UsePipes} from '@nestjs/common';
import * as z from 'zod';
import {ZodValidationPipe} from "./ZodValidationPipe";


type TC1<T> = {
    new (): T;
};

const zodify = <T extends z.ZodType<any>>(zodSchema: T): TC1<z.infer<T>> => {
    class ExtTestDto {
        static ZOD_SCHEMA = zodSchema;
    }

    return ExtTestDto as any;
}

const helloWorldDtoSchema = z.object({
   hello: z.string()
});

const helloWorldDtoSchema2 = z.object({
   world: z.string()
});

class HelloWorldDto extends zodify(helloWorldDtoSchema) {}
class HelloWorldDto2 extends zodify(helloWorldDtoSchema2) {}

@Controller()
export class AppController {
    @Post()
    @UsePipes(ZodValidationPipe)
    postHello(
        @Body() dto: HelloWorldDto
    ): string {
        console.log(dto.hello);
        return 'Hello world';
    }

    @Post('/hello2')
    @UsePipes(ZodValidationPipe)
    postHello2(
        @Body() dto: HelloWorldDto2
    ): string {
        console.log(dto.world);
        return 'Hello world';
    }

    @Get()
    getHello(): string {
        return 'Hello world';
    }
}
