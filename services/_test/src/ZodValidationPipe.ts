import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        // const { error } = this.schema.validate(value);
        // if (error) {
        //     throw new BadRequestException('Validation failed');
        // }
        const zodSchema = metadata?.metatype?.['ZOD_SCHEMA'];

        return zodSchema.parse(value);
    }
}
