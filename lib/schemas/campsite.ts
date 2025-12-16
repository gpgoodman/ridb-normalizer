import {z} from 'zod';
import {AttributeSchema} from '@/lib/schemas/attributes';
import {PermittedEquipmentSchema} from "@/lib/schemas/pemittedEquipment";
import {EntityMediaSchema} from "@/lib/schemas/entityMedia";

const idAsString = z.union([z.string(), z.number()])
    .transform(v => String(v).trim())
    .refine(v => v.length > 0, "ID must be non-empty");

export const CampsiteSchema = z.array(z.object({
    FacilityID:idAsString,
    CampsiteAccessible: z.boolean().default(false),
    CampsiteID: idAsString,
    CampsiteName: idAsString,
    CampsiteLongitude: z.number().nullable().optional(),
    CampsiteLatitude:  z.number().nullable().optional(),
    CreatedDate: z.string().nullable().optional(),
    LastUpdatedDate: z.string().nullable().optional(),
    CampsiteReservable: z.boolean().default(false),
    CampsiteType: z.string(),
    Loop: z.string(),
    TypeOfUse: z.string().nullable().optional(),
    ATTRIBUTES: z.array(AttributeSchema).default([]),
    PERMITTEDEQUIPMENT: z.array(PermittedEquipmentSchema).catch([]),
    ENTITYMEDIA: z.array(EntityMediaSchema).catch([]),
    })

)

export type Campsite = z.infer<typeof CampsiteSchema>;