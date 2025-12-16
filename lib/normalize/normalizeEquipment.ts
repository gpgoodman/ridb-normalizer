import {PermittedEquipment, PermittedEquipmentList} from "@/lib/schemas/pemittedEquipment";
import {NormalizedEquipmentList} from "@/lib/schemas/normalizedEquipment";
import {toTitleCase} from "@/lib/helpers/case";

export const normalizeEquipment = (equipment: PermittedEquipmentList): NormalizedEquipmentList => {
    return equipment.map((e: PermittedEquipment) => {
        return {
            name: toTitleCase(e.EquipmentName),
            maxLength: e.MaxLength
        }
    })
}