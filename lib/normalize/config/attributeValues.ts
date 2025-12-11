const BOOLEAN_ATTRIBUTES = [
    "is equipment mandatory",
    "grills",
    "drinking water",
    "campfire rings",
    "picnic tables",
    "flush toilets",
    "pets allowed",
    "picnic table",
    "shade",
    "bbq",
    "campfire allowed",
    "fire pit",
    "placed on map",
    "tent pads",
    "campfire circles",
    "double driveway",
    "accessibility",
    "accessible occupant message",
    "privacy",
    "quiet area",
    "food locker",
    "paved roads",
    "recycling",
    "food storage locker",
    "water hookup",
    "accessible parking",
    "accessible campsites",
    "accessible picnic area",
    "showers",
    'coin showers',
    "emergency phone",
    "host",
    "campground host",
    "visitor center",
    "lake access",
    "water spigot",
    "electricity",
    "electricity hookup",
    "firewood",
    "firewood vender",
    "firewood vendor",
    "campfire programs",
    "amphitheater",
    "camping supplies",
    "general store",
    "gift shop",
    "parking area",
    "restaurant",
    "accessible flush toilets",
    "accessible showers",
    "fuel",
    "gas",
    "gas station",
    "fuel available",
    "trash collection",
    "ice",
    "rv parking",
    "lantern",
    "corrals",
    "fishing licenses",
    "trailheads",
    "utility sinks",
    "beds with mattress",
    "bed s with mattress",
    "bed(s) with mattress",
    "smoke alarm",
    "propane",
    "laundry",
    "laundromat",
    "laundry facilities",
    "clothes dryer",
    "atm",
    "church",
    "electric hookups",
    "water hookups",
    "sewer hookup"
];


const TRUE_VALUES = ["y", "yes", "true", "1"];
const FALSE_VALUES = ["n", "no", "false", "none", "0"];

const NUMERIC_ATTRIBUTES = [
    "max num of people",
    "max num of vehicles",
    "max vehicle length",
    "min num of people",
    "min num of vehicles",
    "map x coordinate",
    "map y coordinate",
    "driveway length",
    "hike in distance to site",
    "tent pad length",
    "tent pad width",
    "site height/overhead clearance",
    "site length",
    "site width",
    "max num of horses",
    "num of beds"
];

function isBooleanAttribute(attributeName: string): boolean {
    return BOOLEAN_ATTRIBUTES.includes(attributeName);
}

function isNumericAttribute(attributeName: string): boolean {
    return NUMERIC_ATTRIBUTES.includes(attributeName);
}

function parseNumber(raw: string): number | null {
    const trimmed = raw.trim();
    if (trimmed === "") return null;
    const num = Number(trimmed);
    return Number.isNaN(num) ? null : num;
}

function parseBoolean(
    rawValue: string,
    attributeName?: string
): boolean | null {
    const val = rawValue.trim().toLowerCase();
    const name = attributeName ? attributeName : null;

    // Standard true/false patterns
    if (TRUE_VALUES.includes(val)) return true;
    if (FALSE_VALUES.includes(val)) return false;

    // Special case: name == value and this is a known boolean-ish attribute
    if (name && name === val && isBooleanAttribute(name)) {
        return true;
    }

    return null;
}

export function normalizeName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\s+/g, " ");
}

export type NormalizedValueResult =
    | { value: boolean; valueType: "boolean" }
    | { value: number; valueType: "number" }
    | { value: string; valueType: "string" };

export function normalizeAttributeValue(attributeName: string, rawValue: string): NormalizedValueResult {
    const normalizedName = normalizeName(attributeName);

    if (isBooleanAttribute(normalizedName)) {
        const bool = parseBoolean(rawValue, normalizedName);
        if (bool !== null) {
            return {value: bool, valueType: "boolean" as const};
        }
    }

    if (isNumericAttribute(normalizedName)) {
        const num = parseNumber(rawValue);
        if (num !== null) {
            return {value: num, valueType: "number" as const};
        }
    }
    return {value: rawValue, valueType: "string" }

}