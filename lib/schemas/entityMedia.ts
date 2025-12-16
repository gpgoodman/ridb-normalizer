import {z} from "zod";

const numberish = z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? Number(v.trim()) : v))
    .refine((n) => Number.isFinite(n), "Must be a valid number");

export const EntityMediaSchema = z.object({
    Credits: z.string().nullable().optional(),
    Description: z.string().nullable().optional(),
    Height: numberish,
    Width: numberish,
    IsGallery: z.boolean().default(false),
    IsPreview: z.boolean().default(false),
    IsPrimary: z.boolean().default(false),
    MediaType: z.string().nullable().optional(),
    Subtitle: z.string().nullable().optional(),
    Title: z.string().nullable().optional(),
    URL: z.url(),
})

export type EntityMedia =  z.infer<typeof EntityMediaSchema>;

export const EntityMediaArraySchema = z.array(EntityMediaSchema);
export type EntityMediaList = z.infer<typeof EntityMediaArraySchema>;