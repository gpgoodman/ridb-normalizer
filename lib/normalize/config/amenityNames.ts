export const AMENITY_NAMES = [
    "picnic table",
    "picnic tables",
    "grill",
    "grills",
    "fire ring",
    "fire rings",
    "fire pit",
    'campfire ring',
    'campfire rings',
    "fire pit",
    "fire pits",
    "flush toilets",
    "vault toilets",
    "showers",
    "drinking water",
    "shade",
    "bbq"
];

export function normalizeName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\s+/g, " ");
}

export function isAmenity(attributeName: string): boolean {
    const normalized = normalizeName(attributeName);
    return AMENITY_NAMES.includes(normalized);
}