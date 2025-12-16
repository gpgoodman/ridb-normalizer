import {z} from "zod";
import {NormalizedAttributeSchema} from "@/lib/schemas/normalizedAttributes";
import {NormalizedEquipmentSchema} from "@/lib/schemas/normalizedEquipment";
import {NormalizedMediaSchema} from "@/lib/schemas/normalizedMedia";

export const NormalizedCampsiteSchema = z.object({
    campgroundId: z.string(),
    ridbSiteId: z.string(),
    siteNumber: z.string(),
    loop: z.string().nullable().optional(),
    isAccessible: z.boolean(),
    use: z.string().nullable().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    reservable: z.boolean(),
    type: z.string(),
    updated: z.string().nullable().optional(),
    created: z.string().nullable().optional(),
    features: z.array(NormalizedAttributeSchema),
    equipment: z.array(NormalizedEquipmentSchema),
    media: z.array(NormalizedMediaSchema),
})

export type NormalizedCampsite = z.infer<typeof NormalizedCampsiteSchema>;