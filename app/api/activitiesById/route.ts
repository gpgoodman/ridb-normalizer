import { NextResponse } from 'next/server';
import { Activities, ActivitiesSchema } from "@/lib/schemas/activities";
import { normalizeActivities } from "@/lib/normalize/normalizeActivities";

export const dynamic = 'force-dynamic';

const RIDB_BASE_URL = 'https://ridb.recreation.gov/api/v1/facilities';
const FETCH_TIMEOUT_MS = 12_000;
const RIDB_PAGE_LIMIT = 50; // RIDB max page size
const MAX_PAGES_DEFAULT = 10; // safety valve for default "fetch all" mode

function getErrorMessage(err: unknown): string {
    return err instanceof Error ? err.message : 'Unknown error';
}

async function fetchWithTimeout(url: string, headers: HeadersInit): Promise<Response> {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
    try {
        const res = await fetch(url, { headers, cache: 'no-store', signal: ac.signal });
        return res;
    } finally {
        clearTimeout(to);
    }
}

/**
 * @openapi
 * /api/activitiesById:
 *   get:
 *     summary: Fetch and normalize RIDB facility activitiesById data.
 *     description: >
 *       Returns a normalized view of a single facility's activities by facility id from the Recreation Information
 *       Database (RIDB). You can try this using a facility ID taken from a
 *       recreation.gov campground URL.
 *
 *       For example, the Mather Campground URL:
 *       https://www.recreation.gov/camping/campgrounds/232490
 *       has facility ID **232490**.
 *
 *       This endpoint will page through RIDB results using the provided `limit` and `offset`
 *       values (or their defaults) and return all activities for the facility starting at
 *       that offset. You can optionally use `take` to limit the number of normalized items
 *       returned by this endpoint.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: >
 *           RIDB FacilityID (numeric ID from the recreation.gov campground URL),
 *           e.g. **232490** for Mather Campground at Grand Canyon.
 *         schema:
 *           type: string
 *           example: "232490"
 *           default: "232490"
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         description: >
 *           Number of activity records to request from RIDB for this facility per page (page size).
 *           Must be an integer between 1 and 50 (RIDB maximum). Defaults to **50** when not provided.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           example: 50
 *           default: 50
 *
 *       - in: query
 *         name: offset
 *         required: false
 *         description: >
 *           Start record of the overall result set, as defined by the RIDB API.
 *           Must be a non-negative integer. Defaults to **0** when not provided.
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 0
 *           default: 0
 *
 *       - in: query
 *         name: take
 *         required: false
 *         description: >
 *           Maximum number of normalized activity items to return **from this endpoint**.
 *           Unlike RIDB's `limit` (page size), `take` limits the final response array
 *           after all paging and normalization is complete. If omitted or set to `0`,
 *           all normalized results are returned.
 *           This feature does not exist in the RIDB API.
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 0
 *           default: 0
 *
 *     responses:
 *       200:
 *         description: Normalized activities by facility
 *       400:
 *         description: Missing or invalid query parameters (e.g. id, limit, offset, or take)
 *       500:
 *         description: RIDB error or server error
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id'); // /api/activitiesById?id=232490

        if (!id) {
            return NextResponse.json(
                { error: "Missing required query parameter: 'id'" },
                { status: 400 }
            );
        }

        if (!process.env.RIDB_API_KEY) {
            return NextResponse.json(
                { error: 'Server misconfigured: missing RIDB_API_KEY' },
                { status: 500 }
            );
        }

        const rawLimit = searchParams.get('limit');
        const rawOffset = searchParams.get('offset');
        const rawTake = searchParams.get('take');

        // --- Parse & validate limit ---
        let limit = RIDB_PAGE_LIMIT; // default
        if (rawLimit !== null) {
            const parsedLimit = Number(rawLimit);
            if (
                !Number.isInteger(parsedLimit) ||
                parsedLimit < 1 ||
                parsedLimit > RIDB_PAGE_LIMIT
            ) {
                return NextResponse.json(
                    {
                        error: `Invalid 'limit' query parameter. Must be an integer between 1 and ${RIDB_PAGE_LIMIT}.`,
                    },
                    { status: 400 }
                );
            }
            limit = parsedLimit;
        }

        // --- Parse & validate offset ---
        let offset = 0; // default
        if (rawOffset !== null) {
            const parsedOffset = Number(rawOffset);
            if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
                return NextResponse.json(
                    {
                        error: "Invalid 'offset' query parameter. Must be a non-negative integer.",
                    },
                    { status: 400 }
                );
            }
            offset = parsedOffset;
        }

        // --- Parse & validate take ---
        let take: number | null = null;
        if (rawTake !== null) {
            const parsedTake = Number(rawTake);

            // take = 0 → treat as “no limit”
            if (parsedTake === 0) {
                take = null;
            } else if (!Number.isInteger(parsedTake) || parsedTake < 0) {
                return NextResponse.json(
                    { error: "Invalid 'take' query parameter. Must be a non-negative integer." },
                    { status: 400 }
                );
            } else {
                take = parsedTake; // 1 or more
            }
        }

        const headers = {
            accept: 'application/json',
            apikey: process.env.RIDB_API_KEY!,
        };

        // --- Fetch activities for the facility using paging + TOTAL_COUNT to decide when to stop ---
        const all: Activities['RECDATA'] = [];
        let currentOffset = offset;
        let totalCount: number | null = null;
        const MAX_PAGES = MAX_PAGES_DEFAULT; // safety so we don't accidentally hammer RIDB

        for (let page = 0; page < MAX_PAGES; page++) {
            const url =
                `${RIDB_BASE_URL}/${encodeURIComponent(id)}/activities?limit=${limit}&offset=${currentOffset}`;

            const response = await fetchWithTimeout(url, headers);
            if (!response.ok) {
                throw new Error(`RIDB API responded with ${response.status} ${response.statusText}`);
            }

            let json: unknown;
            try {
                json = await response.json();
            } catch {
                throw new Error('Invalid or incomplete JSON received from RIDB (activitiesById)');
            }

            const parsed: Activities = ActivitiesSchema.parse(json);
            const items = parsed.RECDATA ?? [];
            all.push(...items);

            const meta = parsed.METADATA?.RESULTS;
            if (meta?.TOTAL_COUNT != null) {
                totalCount = meta.TOTAL_COUNT;
            }

            // Stop if no items were returned
            if (items.length === 0) {
                break;
            }

            // Stop if we've already collected all known records
            if (totalCount != null && all.length >= totalCount) {
                break;
            }

            // Fallback: if RIDB honors page size and returns fewer than requested, it's the last page
            if (items.length < limit) {
                break;
            }

            currentOffset += limit;
        }

        let normalized = normalizeActivities(all);

        if (take !== null) {
            normalized = normalized.slice(0, take);
        }

        return NextResponse.json(normalized, { status: 200 });
    } catch (error: unknown) {
        console.error('RIDB activitiesById fetch error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch activitiesById from RIDB',
                details: getErrorMessage(error),
            },
            { status: 500 }
        );
    }
}
