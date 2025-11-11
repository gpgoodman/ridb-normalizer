import { Facility } from "@/lib/schemas/facility";
import { NormalizedFacility, NormalizedFacilitySchema } from "@/lib/schemas/normalizedFacility";
import {normalizeCampgroundName} from "@/lib/normalize/facilityNormalizers";
import {htmlToText, toEmbeddingText} from "@/lib/normalize/text";

export const normalizeFacility = (data: Facility): NormalizedFacility => {
    const descriptionRawHtml = data.FacilityDescription ?? null;
    const description = descriptionRawHtml ? htmlToText(descriptionRawHtml) : null;
    const descriptionForEmbedding = descriptionRawHtml ? toEmbeddingText(descriptionRawHtml) : null;

    const normalized = {
        ridbId: data.FacilityID,
        name: normalizeCampgroundName(data.FacilityName),
        latitude: data.FacilityLatitude,
        longitude: data.FacilityLongitude,
        type: data.FacilityTypeDescription,
        descriptionRawHtml,
        description,
        descriptionForEmbedding,
    };
return NormalizedFacilitySchema.parse(normalized);

}