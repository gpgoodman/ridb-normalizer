import {Campsite, Campsites} from "@/lib/schemas/campsite";
import {normalizeCampsite} from "@/lib/normalize/normalizeCampsite";
import {NormalizedCampsitesList} from "@/lib/schemas/normalizedCampsite";

export const normalizeCampsites = (campsites: Campsites ):NormalizedCampsitesList => {
    return campsites.map((c:Campsite) => {
        return normalizeCampsite(c)
    })
}