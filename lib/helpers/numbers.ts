export function normalizeCoordinate(value:number | null | undefined, decimals = 7):number | null {
    if (value === null || value === undefined) return null;

    const str = String(value).trim();
    if (!str) return null;

    const num = Number(str);
    if (!Number.isFinite(num)) return null;

    // If value came in as a string, only round if it *actually* has >= decimals fractional digits.
    const m = str.match(/^-?\d+(?:\.(\d+))?$/);
    const fracLen = m?.[1]?.length ?? 0;

    if (fracLen >= decimals) {
        const factor = 10 ** decimals;
        return Math.round(num * factor) / factor;
    }

    return num;
}