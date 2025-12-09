import {z} from "zod";

export const AmenitySchema = z.object({
    AttributeName: z.string(),
    AttributeValue: z.string(),
});

export type Amenity = z.infer<typeof AmenitySchema>;

export const AmenitiesSchema = z.object({
    RECDATA: z.array(AmenitySchema).default([]),
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

export type Amenities = z.infer<typeof AmenitiesSchema>;