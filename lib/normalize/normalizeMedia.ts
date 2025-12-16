import {EntityMedia, EntityMediaList} from "@/lib/schemas/entityMedia";
import {z} from "zod";

export const normalizeMedia = (media: EntityMediaList) => {
    return media.map((m: EntityMedia) => {
        return {
            attribution: m.Credits,
            description: m.Description,
            height: m.Height,
            width: m.Width,
            isGallery: m.IsGallery,
            isPreview: m.IsPreview,
            isPrimary: m.IsPrimary,
            type: m.MediaType,
            subtitle: m.Subtitle,
            title: m.Title,
            url: m.URL
        }
    })
}
