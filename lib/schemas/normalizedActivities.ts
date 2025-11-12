import { z } from "zod";

export const NormalizedActivitiesSchema = z.array(z.object({
    id: z.number(),
    name: z.string().optional(),
}));

export type NormalizedActivities = z.infer<typeof NormalizedActivitiesSchema>;
