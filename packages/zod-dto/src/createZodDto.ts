import * as z from 'zod';

export type ZodDtoStatic<T> = {
    new (): T;
    zodSchema: z.ZodType<unknown>;
};

export const createZodDto = <T extends z.ZodType<unknown>>(zodSchema: T): ZodDtoStatic<z.infer<T>> => {
    class SchemaHolderClass {
        public static zodSchema = zodSchema;
    }

    return SchemaHolderClass;
};
