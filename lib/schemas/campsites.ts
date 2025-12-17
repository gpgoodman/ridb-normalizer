import {z} from "zod";

import {CampsitesSchema} from "@/lib/schemas/campsite";

export const RIDBCampsitesResponseSchema = z.object({
    RECDATA: CampsitesSchema,
})

export type RIDBCampsitesResponse = z.infer<typeof RIDBCampsitesResponseSchema>