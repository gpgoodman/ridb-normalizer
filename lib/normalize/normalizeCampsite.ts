import {NormalizedCampsite} from "@/lib/schemas/normalizedCampsite";
import {Campsite} from "@/lib/schemas/campsite";
import {normalizeAttributes} from "@/lib/normalize/normalizeAttributes";
import {normalizeEquipment} from "@/lib/normalize/normalizeEquipment";
import {normalizeMedia} from "@/lib/normalize/normalizeMedia";

export const normalizeCampsite = (data: Campsite):NormalizedCampsite => {
    const campsite = data[0];
    return {
        features: normalizeAttributes(campsite.ATTRIBUTES),
        equipment: normalizeEquipment(campsite.PERMITTEDEQUIPMENT),
        media: normalizeMedia(campsite.ENTITYMEDIA)
    }
}



