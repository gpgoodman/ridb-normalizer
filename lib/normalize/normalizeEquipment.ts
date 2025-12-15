import {PermittedEquipment, PermittedEquipmentList} from "@/lib/schemas/pemittedEquipment";
import {NormalizedEquipmentList} from "@/lib/schemas/normalizedEquipment";

export const normalizeEquipment = (equipment: PermittedEquipmentList): NormalizedEquipmentList => {
    return equipment.map((e: PermittedEquipment) => {
        return {
            name: e.EquipmentName,
            maxLength: e.MaxLength
        }
    })
}