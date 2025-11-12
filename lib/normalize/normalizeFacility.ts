import { Facility } from "@/lib/schemas/facility";
import { NormalizedFacility, NormalizedFacilitySchema } from "@/lib/schemas/normalizedFacility";
import {normalizeCampgroundName, normalizeParkType} from "@/lib/normalize/facilityNormalizers";
import {htmlToText, toEmbeddingText} from "@/lib/normalize/text";

export const normalizeFacility = (data: Facility): NormalizedFacility => {

    const descriptionRawHtml = data.FacilityDescription ?? null;
    const description = descriptionRawHtml ? htmlToText(descriptionRawHtml) : null;
    const descriptionForEmbedding = descriptionRawHtml ? toEmbeddingText(descriptionRawHtml) : null;
    const park = data.RECAREA?.[0]?.RecAreaName?.trim() ?? 'Unknown';
    const parkType = normalizeParkType(park);

    const normalized = {
        ridbId: data.FacilityID,
        name: normalizeCampgroundName(data.FacilityName),
        park,
        parkType,
        latitude: data.FacilityLatitude,
        longitude: data.FacilityLongitude,
        type: data.FacilityTypeDescription?.toLowerCase(),
        reservations: `https://www.recreation.gov/camping/campgrounds/${data.FacilityID}`,
        descriptionRawHtml,
        description,
        descriptionForEmbedding,
    };
return NormalizedFacilitySchema.parse(normalized);

}