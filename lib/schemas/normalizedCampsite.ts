import {z} from "zod";
import {NormalizedAttributeSchema} from "@/lib/schemas/normalizedAttributes";
import {NormalizedEquipmentSchema} from "@/lib/schemas/normalizedEquipment";
import {NormalizedMediaSchema} from "@/lib/schemas/normalizedMedia";

export const NormalizedCampsiteSchema = z.object({
    features: z.array(NormalizedAttributeSchema),
    equipment: z.array(NormalizedEquipmentSchema),
    media: z.array(NormalizedMediaSchema),
})

export type NormalizedCampsite = z.infer<typeof NormalizedCampsiteSchema>;