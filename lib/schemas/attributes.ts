import {z} from "zod";

export const AttributeSchema = z.object({
    AttributeName: z.string(),
    AttributeValue: z.string(),
});

export type Attribute = z.infer<typeof AttributeSchema>;

export const AttributesSchema = z.object({
    RECDATA: z.array(AttributeSchema).default([]),
    METADATA: z.object({
        RESULTS: z.object({
            CURRENT_COUNT: z.number().optional(),
            TOTAL_COUNT: z.number().optional(),
        }),
        SEARCH_PARAMETERS: z.object({
            LIMIT: z.number().optional(),
            OFFSET: z.number().optional(),
            QUERY: z.string().optional(),
        })
    }),
})

export type Attributes = z.infer<typeof AttributesSchema>;
export const AttributeArraySchema = z.array(AttributeSchema);
export type AttributeList = z.infer<typeof AttributeArraySchema>;