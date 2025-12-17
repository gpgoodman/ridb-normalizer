export const dynamic = 'force-dynamic';
import {normalizeCampsites} from "@/lib/normalize/normalizeCampsites";
import {Campsites, CampsitesSchema} from "@/lib/schemas/campsite";
import {NextResponse} from 'next/server';
import {RIDBCampsitesResponseSchema, RIDBCampsitesResponse} from "@/lib/schemas/campsites"

const RIDB_BASE_URL = 'https://ridb.recreation.gov/api/v1/facilities';
const FETCH_TIMEOUT_MS = 12_000;
const RIDB_PAGE_LIMIT = 50; // RIDB max page size
const MAX_PAGES_DEFAULT = 600; // safety valve in getAll mode

function getErrorMessage(err: unknown): string {
    return err instanceof Error ? err.message : 'Unknown error';
}

async function fetchWithTimeout(url: string, headers: HeadersInit): Promise<Response> {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
    try {
        const res = await fetch(url, {headers, cache: 'no-store', signal: ac.signal});
        return res;
    } finally {
        clearTimeout(to);
    }
}

/**
 * @openapi
 * /api/v1/ridb/campsitesByFacilityId:
 *   get:
 *     tags:
 *       - Campsites
 *     summary: Fetch and normalize RIDB campsites by facility.
 *     description: >
 *       Returns a normalized view of campsites per campground from the Recreation Information
 *       Database (RIDB).
 *
 *       We supplement the data by parsing the intent, and categorize site features by scope,
 *       (e.g. campsite level or campground level), and stuff like is the feature an amenity?
 *
 *       One use case is, you can now easily filter for campground scoped attributes or campsite level,
 *       making the data much more versatile by keeping two concerns separate.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: >
 *           RIDB FacilityID (numeric ID from the recreation.gov campground URL),
 *           e.g. **234672** for Upper Stony Creek in the Sequoia National Forest.
 *         schema:
 *           type: string
 *           example: 234672
 *       - in: query
 *         name: query
 *         required: false
 *         description: >
 *           Query filter criteria. Searches on campsites using RIDB's substring
 *           matcher (e.g. `query=3` will match sites "3", "13", etc). If left blank, this
 *           parameter is ignored and all activities are returned. This is just a pass through behavior
 *           from the raw api.
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         description: >
 *           Page size for a single request to RIDB. Must be an integer between 1
 *           and 50 (RIDB maximum). Defaults to **5** when not provided.
 *           Swagger's UI lags a lot on large responses, so recommend starting with limit of 5
 *           if you just want to sample the data.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           example: 5
 *           default: 50
 *
 *       - in: query
 *         name: offset
 *         required: false
 *         description: >
 *           Start record of the overall result set, as defined by the RIDB API.
 *           Must be a non-negative integer. Defaults to **0** when not provided.
 *           Ignored when `getAll=true`.
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 0
 *           default: 0
 *
 *       - in: query
 *         name: includeRaw
 *         required: false
 *         description: >
 *           When true, this endpoint will include the raw RIDB response, useful for
 *           debugging.
 *         schema:
 *           type: boolean
 *           example: false
 *           default: false
 *
 *     responses:
 *       200:
 *         description: Normalized campsites by facility (campground)
 *       400:
 *         description: Invalid query parameters (e.g. limit or offset)
 *       500:
 *         description: RIDB error or server error
 */

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url);

        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: "Missing required query parameter: 'id'" },
                { status: 400 }
            );
        }

        if (!process.env.RIDB_API_KEY) {
            return NextResponse.json(
                {error: 'Server misconfigured: missing RIDB_API_KEY'},
                {status: 500}
            );
        }


        const rawIncludeRaw = searchParams.get('includeRaw');
        const includeRaw = rawIncludeRaw === 'true';

        const rawLimit = searchParams.get('limit');
        const rawOffset = searchParams.get('offset');

        const rawQuery = searchParams.get('query');
        const query =
            rawQuery && rawQuery.trim() !== '' ? rawQuery.trim() : null;

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


        const headers = {
            accept: 'application/json',
            apikey: process.env.RIDB_API_KEY!,
        };

        const url =
            `${RIDB_BASE_URL}/${encodeURIComponent(id)}/campsites?limit=${limit}&offset=${offset}` +
            (query ? `&query=${encodeURIComponent(query)}` : '');

        const response = await fetchWithTimeout(url, headers);

        if (!response.ok) {
            throw new Error(`RIDB API responded with ${response.status} ${response.statusText}`);
        }

        let json: unknown;

        try {
            json = await response.json();
        } catch {
            throw new Error('Invalid or incomplete JSON received from RIDB (activities)');
        }

        const parsed: RIDBCampsitesResponse = RIDBCampsitesResponseSchema.parse(json);

        const items = parsed.RECDATA ?? [];

        // console.log(items.length);

        if(includeRaw) {
            return NextResponse.json({raw: items, normalized: normalizeCampsites(items)}, { status: 200 });
        }

        return NextResponse.json({normalized: normalizeCampsites(items)}, { status: 200 });


    } catch (error: unknown) {
        console.error('RIDB activities fetch error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch activities from RIDB',
                details: getErrorMessage(error),
            },
            {status: 500}
        );
    }
}




