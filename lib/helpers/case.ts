export function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (char: string): string => char.toUpperCase());
}

export function normalizeToLowerCase(str: string): string {
    return str.toLowerCase()
        .trim();
}