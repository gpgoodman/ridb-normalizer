import {Attribute, AttributeList} from "@/lib/schemas/attributes";
import {NormalizedAttributes} from "@/lib/schemas/normalizedAttributes";
import {isAmenity} from "@/lib/normalize/config/amenityNames";
import {getAttributeScope} from "@/lib/normalize/config/attributeScopes";
import {normalizeAttributeValue} from "@/lib/normalize/config/attributeValues";

function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (char: string): string => char.toUpperCase());
}

export const normalizeAttributes = (data: AttributeList): NormalizedAttributes => {
    return data.map((a: Attribute) => {
        return {
            label: toTitleCase(a.AttributeName),
            scope: getAttributeScope(a.AttributeName),
            isAmenity: isAmenity(a.AttributeName),
            ...normalizeAttributeValue(a.AttributeName, a.AttributeValue)
        }
    })
}