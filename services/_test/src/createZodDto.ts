import * as z from "zod";

export type ZodDtoStatic<T> = {
    new (): T;
    ZOD_SCHEMA: z.ZodType<any>;
};

export const createZodDto = <T extends z.ZodType<any>>(zodSchema: T): ZodDtoStatic<z.infer<T>> => {
    class SchemaHolderClass {
        static ZOD_SCHEMA = zodSchema;
    }

    return SchemaHolderClass as any;
}
