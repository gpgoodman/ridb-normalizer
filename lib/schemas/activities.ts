import { z } from 'zod';

// 1) Item schema (reusable)
export const ActivitySchema = z.object({
    ActivityID: z.number(),          // or z.coerce.number() if you prefer numbers
    ActivityName: z.string(),
});
export type Activity = z.infer<typeof ActivitySchema>;

// 2) Page schema (wraps the item schema)
export const ActivitiesSchema = z.object({
    RECDATA: z.array(ActivitySchema).default([]),
    METADATA: z.object({
        RESULTS: z.object({
            TOTAL_COUNT: z.number().optional(),
            OFFSET: z.number().optional(),
            LIMIT: z.number().optional(),
        }).partial().optional(),
    }).partial().optional(),
});
export type Activities = z.infer<typeof ActivitiesSchema>;

export const ActivityArraySchema = z.array(ActivitySchema);
export type ActivityList = z.infer<typeof ActivityArraySchema>;
