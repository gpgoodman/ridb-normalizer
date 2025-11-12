/**
 * Title-cases a string but handles hyphens and apostrophes sensibly.
 * e.g. "fish creek" -> "Fish Creek", "o'neill" -> "O'Neill", "east-west" -> "East-West"
 */
export function toSmartTitleCase(input: string): string {
    return input
        .split(/\s+/)
        .map(word => {
            return word
                .split(/(-)/) // keep hyphens and rejoin
                .map(part => {
                    if (part === '-') return part;
                    // Handle apostrophes inside a word (O'NEILL -> O'Neill)
                    return part
                        .toLowerCase()
                        .replace(/^([a-z])|(['])([a-z])/g, (m, p1, p2, p3) =>
                            p1 ? p1.toUpperCase() : p2 + p3.toUpperCase()
                        );
                })
                .join('');
        })
        .join(' ');
}

/**
 * Normalizes a campground "name" coming from RIDB into the canonical Campvue label:
 *  - Unicode normalize & trim
 *  - collapse whitespace
 *  - strip the word "campground" (and common variants) anywhere it appears as its own token
 *  - remove leading/trailing separators
 *  - title-case the remainder
 *  - preserve common acronyms (RV, BLM, NPS) in all caps
 */
export function normalizeCampgroundName(raw: string): string {
    if (!raw) return '';

    // 1) Unicode normalize & squish whitespace
    let s = raw.normalize('NFC').replace(/\s+/g, ' ').trim();

    // 2) Normalize separators (commas, slashes, dashes flanked by spaces) to single spaces
    s = s.replace(/[–—]/g, '-') // en/em dash -> hyphen
        .replace(/\s*[-/|]\s*/g, ' ')
        .replace(/[(),]/g, match => (match === ',' ? ' ' : '')) // drop parens, turn commas to spaces
        .replace(/\s+/g, ' ')
        .trim();

    // 3) Remove "campground" tokens (and a few variants) as standalone words (case-insensitive)
    //    e.g. "FISH CREEK CAMPGROUND" -> "FISH CREEK"
    //         "MATHER CAMPGROUND LOOP B" -> "MATHER LOOP B"
    const CAMPGROUND_PATTERNS = [
        'camp\\s*ground', // "camp ground"
        'campground',
        'campgrounds',
        'cg',             // common abbreviation on signage
        'cmpg', 'cmpgd', 'campgrnd', 'campg?d', // sloppy variants
    ];
    const campgroundRegex = new RegExp(`\\b(?:${CAMPGROUND_PATTERNS.join('|')})\\b`, 'gi');
    s = s.replace(campgroundRegex, ' ').replace(/\s+/g, ' ').trim();

    // 4) Clean trailing "area"/"park" that sometimes gets tacked on to the facility label
    //    Only strip if it's clearly a tailing qualifier, not part of a multi-word name like "Glacier National Park"
    s = s.replace(/\b(?:area|park)\b\s*$/i, '').trim();

    // 5) Title case smartly
    s = toSmartTitleCase(s);

    // 6) Preserve common acronyms fully uppercased
    const ACRONYMS = new Set(['RV', 'BLM', 'NPS', 'USFS', 'BLM', 'BIA']);
    s = s
        .split(' ')
        .map(w => (ACRONYMS.has(w.toUpperCase()) ? w.toUpperCase() : w))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

    return s;
}


export const normalizeParkType = (park:string):string | null => {
    if (!park) return null;

    const name = park.toLowerCase();

    if (name.includes('national forest')) return 'national forest';
    if (name.includes('national monument')) return 'national monument';
    if (name.includes('national park')) return 'national';

    return null;
}


