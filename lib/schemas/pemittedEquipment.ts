import { z } from "zod";

const numberish = z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? Number(v.trim()) : v))
    .refine((n) => Number.isFinite(n), "Must be a valid number");

export const PermittedEquipmentSchema = z.object({
        EquipmentName: z.string().min(1),  // avoids "" slipping through
        MaxLength: numberish,             // coerced number, rejects NaN
    })

export type PermittedEquipment = z.infer<typeof PermittedEquipmentSchema>;

export const PermittedEquipmentArraySchema = z.array(PermittedEquipmentSchema);
export type PermittedEquipmentList = z.infer<typeof PermittedEquipmentArraySchema>;