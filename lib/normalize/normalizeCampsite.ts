import {NormalizedCampsite} from "@/lib/schemas/normalizedCampsite";
import {Campsite} from "@/lib/schemas/campsite";
import {normalizeAttributes} from "@/lib/normalize/normalizeAttributes";
import {normalizeEquipment} from "@/lib/normalize/normalizeEquipment";
import {normalizeMedia} from "@/lib/normalize/normalizeMedia";
import {normalizeSiteNumber} from "@/lib/helpers/site";
import {toTitleCase} from "@/lib/helpers/case";
import {normalizeCoordinate} from "@/lib/helpers/numbers";

export const normalizeCampsite = (data: Campsite):NormalizedCampsite => {
    const campsite = data[0];
    return {
        campgroundId: campsite.FacilityID,
        ridbSiteId: campsite.CampsiteID,
        siteNumber: normalizeSiteNumber(campsite.CampsiteName),
        loop: toTitleCase(campsite.Loop),
        isAccessible: campsite.CampsiteAccessible,
        use: campsite.TypeOfUse,
        latitude: normalizeCoordinate(campsite.CampsiteLatitude),
        longitude: normalizeCoordinate(campsite.CampsiteLongitude),
        reservable: campsite.CampsiteReservable,
        type: toTitleCase(campsite.CampsiteType),
        created: campsite.CreatedDate,
        updated: campsite.LastUpdatedDate,
        features: normalizeAttributes(campsite.ATTRIBUTES),
        equipment: normalizeEquipment(campsite.PERMITTEDEQUIPMENT),
        media: normalizeMedia(campsite.ENTITYMEDIA),
    }
}



