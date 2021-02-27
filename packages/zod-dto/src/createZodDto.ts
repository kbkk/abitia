import * as z from 'zod';

export type ZodDtoStatic<T> = {
    new (): T;
    zodSchema: z.ZodType<unknown>;
    create(input: unknown): T;
};

export const createZodDto = <T extends z.ZodType<unknown>>(zodSchema: T): ZodDtoStatic<z.infer<T>> => {
    class SchemaHolderClass {
        public static zodSchema = zodSchema;

        public static create(input: unknown): T {
            return this.zodSchema.parse(input) as T;
        }
    }

    return SchemaHolderClass;
};
