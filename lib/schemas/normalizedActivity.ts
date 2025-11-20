import { z } from "zod";

export const NormalizedActivititySchema = z.object({
    id: z.number(),
    name: z.string().optional(),
});

export type NormalizedActivity = z.infer<typeof NormalizedActivititySchema>;
