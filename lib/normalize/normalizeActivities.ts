import {Activity, ActivityList} from "@/lib/schemas/activities";
import {NormalizedActivities} from "@/lib/schemas/normalizedActivities";


function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (char: string): string => char.toUpperCase());
}

export const normalizeActivities = (data: ActivityList): NormalizedActivities => {
    return data.map((a: Activity) => {
        return {
            id: a.ActivityID,
            name: toTitleCase(a.ActivityName),
        }
    })
}