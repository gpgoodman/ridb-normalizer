import { z } from "zod";

export const NormalizedAttributeSchema =  z.object({
    // key: z.string(),
    label: z.string(),
    scope: z.enum(['campground', 'campsite', 'unknown']),
    isAmenity: z.boolean(),
    valueType: z.enum(["string", "number", "boolean"]),
    value: z.union([
        z.string(),
        z.number(),
        z.boolean(),
    ]),
});

export type NormalizedAttribute = z.infer<typeof NormalizedAttributeSchema>;

export const NormalizedAttributesSchema = z.array(NormalizedAttributeSchema);

export type NormalizedAttributes = z.infer<typeof NormalizedAttributesSchema>;