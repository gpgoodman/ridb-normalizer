import {z} from "zod";
import {NormalizedAttributeSchema} from "@/lib/schemas/normalizedAttributes";
import {NormalizedEquipmentSchema} from "@/lib/schemas/normalizedEquipment";

export const NormalizedCampsiteSchema = z.object({
    features: z.array(NormalizedAttributeSchema),
    equipment: z.array(NormalizedEquipmentSchema),
})

export type NormalizedCampsite = z.infer<typeof NormalizedCampsiteSchema>;