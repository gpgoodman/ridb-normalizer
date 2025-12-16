export function normalizeSiteNumber(siteNumber:string):string {

    // Convert to string, trim, uppercase
    const raw = String(siteNumber).trim().toUpperCase();

    // Remove everything except letters and numbers
    const alphanumeric = raw.replace(/[^A-Z0-9]/g, "");

    // If it's purely numeric, strip leading zeros
    if (/^\d+$/.test(alphanumeric)) {
        return String(Number(alphanumeric));
    }

    // If it has letters + numbers, strip leading zeros from numeric portions
    return alphanumeric.replace(/\d+/g, (match) => String(Number(match)));
}
