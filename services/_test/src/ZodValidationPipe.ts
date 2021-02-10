import {PipeTransform, Injectable, ArgumentMetadata, UnprocessableEntityException} from '@nestjs/common';
import {ZodDtoStatic} from "./createZodDto";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        const zodSchema = (metadata?.metatype as ZodDtoStatic<unknown>)?.ZOD_SCHEMA;

        if(zodSchema) {
            const parseResult = zodSchema.safeParse(value);

            if(!parseResult.success) {
                const {error} = parseResult;
                const message =  error.errors
                    .map(error => `${error.path.join('.')}: ${error.message}`)
                    .join(',');
                throw new UnprocessableEntityException(`Input validation failed: ${message}`);
            }
        }

        return value;
    }
}
