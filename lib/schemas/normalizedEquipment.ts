import {z} from "zod";

export const NormalizedEquipmentSchema = z.object({
    name: z.string(),
    maxLength: z.number()
})

export type NormalizedEquipment = z.infer<typeof NormalizedEquipmentSchema>

export const NormalizedEquipmentSchemaList = z.array(NormalizedEquipmentSchema);

export type NormalizedEquipmentList = z.infer<typeof NormalizedEquipmentSchemaList>
