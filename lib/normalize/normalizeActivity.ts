import {Activity} from "@/lib/schemas/activities";
import {NormalizedActivity} from "@/lib/schemas/normalizedActivity";


function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (char: string): string => char.toUpperCase());
}

export const normalizeActivity = (data: Activity): NormalizedActivity => {
        return {
            id: data.ActivityID,
            name: toTitleCase(data.ActivityName),
        }
}