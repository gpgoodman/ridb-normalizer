import {z} from 'zod';

export const MaxLengthsCampsitesSchema =
    z.array(z.object({
            ridbSiteId: z.string(),
            siteNumber: z.string(),
            maxLength: z.number(),
        }
    ));

export type MaxLengths = z.infer<typeof MaxLengthsCampsitesSchema>;


export const MaxLengthSchema = z.object({
    facilityId: z.string(),
    maxLength: z.number(),
    sites: MaxLengthsCampsitesSchema
})


export type MaxLength = z.infer<typeof MaxLengthsCampsitesSchema>;