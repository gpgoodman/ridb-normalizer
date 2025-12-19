import {Campsite, Campsites} from "@/lib/schemas/campsite";
import {PermittedEquipmentList} from "@/lib/schemas/pemittedEquipment";
import {normalizeSiteNumber} from "@/lib/helpers/site";
import {MaxLengths} from "@/lib/schemas/campvue/maxLength";

function getMaxVehicleLengthCampsite(equipment: PermittedEquipmentList = []):number {
    let max = 0

    for (const item of equipment) {
        if (!item || typeof item !== 'object') continue

        const name = String(item.EquipmentName || '')
            .toLowerCase()
            .trim()

        // Exclude tents (and variations containing "tent")
        if (name.includes('tent')) continue

        const length = Number(item.MaxLength)

        if (Number.isFinite(length) && length > max) {
            max = length
        }
    }

    return max
}

export const normalizeMaxLengths = (campsites: Campsites):MaxLengths => {
    return campsites.map((c:Campsite) => {
        return {
            ridbSiteId: c.CampsiteID,
            siteNumber:normalizeSiteNumber(c.CampsiteName),
            maxLength: getMaxVehicleLengthCampsite(c.PERMITTEDEQUIPMENT)

        }

    })
}