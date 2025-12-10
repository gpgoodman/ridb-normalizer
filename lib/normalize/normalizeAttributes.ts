import {Attribute, AttributeList} from "@/lib/schemas/attributes";
import {NormalizedAttributes} from "@/lib/schemas/normalizedAttributes";
import {isAmenity} from "@/lib/normalize/config/amenityNames";
import {getAttributeScope} from "@/lib/normalize/config/attributeScopes";
import {normalizeAttributeValue} from "@/lib/normalize/config/attributeValues";
import {normalizeName} from "@/lib/normalize/config/attributeValues";

function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (char: string): string => char.toUpperCase());
}

function toKey(name: string): string {
    const normalizedName = normalizeName(name); // e.g. "capacity/size rating"

    return normalizedName
        // replace any run of non-alphanumeric characters with an underscore
        .replace(/[^a-z0-9]+/g, '_')
        // trim possible leading/trailing underscores
        .replace(/^_+|_+$/g, '');
}

export const normalizeAttributes = (data: AttributeList): NormalizedAttributes => {
    return data.map((a: Attribute) => {
        return {
            key: toKey(a.AttributeName),
            label: toTitleCase(a.AttributeName),
            scope: getAttributeScope(a.AttributeName),
            isAmenity: isAmenity(a.AttributeName),
            ...normalizeAttributeValue(a.AttributeName, a.AttributeValue)
        }
    })
}