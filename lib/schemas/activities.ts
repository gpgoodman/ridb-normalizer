import { z } from "zod";

export const ActivitiesSchema = z.object({
    RECDATA: z.array(
        z.object({
            ActivityID: z.number(),            // Keep as string; you can coerce later in a normalizer if desired
            ActivityName: z.string().optional()
        })
    ).default([]),

    METADATA: z.object({
        RESULTS: z.object({
            TOTAL_COUNT: z.number().optional(),
            OFFSET: z.number().optional(),
            LIMIT: z.number().optional(),
        }).partial().optional(),
    }).partial().optional(),
});

export type Activities = z.infer<typeof ActivitiesSchema>;
