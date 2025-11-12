import { z } from "zod";

export const FacilitySchema = z.object({
    FacilityID: z.string(),
    FacilityName: z.string(),
    FacilityDescription: z.string().optional(),
    FacilityLatitude: z.number().nullable(),
    FacilityLongitude: z.number().nullable(),
    FacilityTypeDescription: z.string().optional(),
    RECAREA: z
        .array(
            z.object({
                RecAreaName: z.string(),
            })
        )
        .optional(),
    // ... add more fields as you explore the RIDB response
});

export type Facility = z.infer<typeof FacilitySchema>;
