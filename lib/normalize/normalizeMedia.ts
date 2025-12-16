import {EntityMedia, EntityMediaList} from "@/lib/schemas/entityMedia";
import {normalizeToLowerCase} from "@/lib/helpers/case";

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
            type: normalizeToLowerCase(m.MediaType),
            subtitle: m.Subtitle,
            title: m.Title,
            url: m.URL
        }
    })
}
