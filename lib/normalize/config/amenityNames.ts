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
    "water spigot",
    "shade",
    "bbq",
    "tent pads",
    "campfire circles",
    "food locker",
    "food storage locker",
    "recycling",
    "water hookup",
    "coin showers",
    "emergency phone",
    "electricity",
    "electricity hookup",
    "electric hookups",
    "firewood",
    "firewood vender",
    "firewood vendor",
    "amphitheater",
    "camping supplies",
    "general store",
    "gift shop",
    "restaurant",
    "accessible flush toilets",
    "accessible showers",
    "fuel",
    "gas",
    "gas station",
    "fuel available",
    "trash collection",
    "ice",
    "utility sinks",
    "beds with mattress",
    "bed s with mattress",
    "bed(s) with mattress",
    "propane",
    "laundry",
    "laundromat",
    "laundry facilities",
    "clothes dryer",
    "atm",
    "bed type",
    "church",
    "water hookups",
    "sewer hookup"
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