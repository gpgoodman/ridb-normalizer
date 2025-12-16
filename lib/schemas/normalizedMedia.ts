import {z} from "zod";

export const NormalizedMediaSchema = z.object({
    attribution: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    height: z.number(),
    width: z.number(),
    isGallery: z.boolean(),
    isPreview: z.boolean(),
    isPrimary: z.boolean(),
    type: z.string().nullable().optional(),
    subtitle: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    url: z.url()
})

export type NormalizedMedia = z.infer<typeof NormalizedMediaSchema>

export const NormalizedMediaListSchema = z.array(NormalizedMediaSchema);

export type NormalizedMediaList = z.infer<typeof NormalizedMediaListSchema>


