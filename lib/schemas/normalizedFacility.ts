import { z } from "zod";

export const NormalizedFacilitySchema = z.object({
    ridbId: z.string(),
    name: z.string(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    type: z.string().optional(),
    descriptionRawHtml: z.string().optional(),
    description: z.string().optional(),
    descriptionForEmbedding: z.string().optional(),

    // ... add more fields as you explore the RIDB response
});

export type NormalizedFacility = z.infer<typeof NormalizedFacilitySchema>;
