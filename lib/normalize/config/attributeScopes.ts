export const CAMPGROUND_SCOPE = [
    "grills",
    "drinking water",
    "water spigots",
    "water spigot",
    "campfire rings",
    "fire rings",
    "campfires",
    "picnic tables",
    "tables",
    "toilets",
    "flush toilets",
    "vault toilets",
    "showers",
    "pets",
    "pets allowed",
    "campfire allowed",
    "checkin time",
    "checkout time",

]

export const CAMPSITE_SCOPE = [
    "equipment",
    "is equipment mandatory",
    "picnic table",
    "fire ring",
    "shade",
    "site access",
    "bbq",
    "grill",
    "capacity/size rating",
    "driveway entry",
    "driveway grade",
    "driveway surface",
    "fire pit",
    "max num of people",
    "max num of vehicles",
    "max vehicle length",
    "min num of people",
    "min num of vehicles",
    "map x coordinate",
    "map y coordinate",
    "placed on map"
]

export function normalizeName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\s+/g, " ");
}

export function getAttributeScope(attributeName: string): 'campground' | 'campsite' | 'unknown' {
    const normalized = normalizeName(attributeName);
    if(CAMPGROUND_SCOPE.includes(normalized)) return 'campground';
    if(CAMPSITE_SCOPE.includes(normalized)) return 'campsite';
    return 'unknown';
}