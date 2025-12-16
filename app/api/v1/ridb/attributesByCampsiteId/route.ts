export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {Attributes, AttributesSchema} from "@/lib/schemas/attributes";
import {normalizeAttributes} from "@/lib/normalize/normalizeAttributes";

const RIDB_BASE_URL = 'https://ridb.recreation.gov/api/v1/campsites/';

const FETCH_TIMEOUT_MS = 12_000;
const RIDB_PAGE_LIMIT = 50; // RIDB max page size
const MAX_PAGES_DEFAULT = 100;

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
 * /api/v1/ridb/attributesByCampsiteId:
 *   get:
 *     tags:
 *       - Attributes
 *     summary: Fetch and normalize RIDB campsite attributes data.
 *     description: >
 *       Returns a normalized view of attributes from the Recreation Information
 *       Database (RIDB).
 *
 *       By default (when `getAll` is not provided or false), this endpoint returns
 *       a **single page** of activities, controlled by the `limit` and `offset`
 *       parameters.
 *
 *       When `getAll` is true, the endpoint will page through the RIDB /activities
 *       API using a page size of 50 and return **all** activities in a single
 *       response. In this mode, any `limit` and `offset` query parameters are
 *       ignored, even if they appear in the URL (including Swagger UI defaults).
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: >
 *           RIDB CampsiteID (numeric ID from the recreation.gov list of attributes),
 *           e.g. **4000** for site 46 at North Rim Campground at Grand Canyon.
 *         schema:
 *           type: string
 *       - in: query
 *         name: query
 *         required: false
 *         description: >
 *           Query filter criteria. Searches on attribute name using RIDB's substring
 *           matcher (e.g. `query=Fire Pit` will match "Fire Pit"). If left blank, this
 *           parameter is ignored and all attribute are returned.
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         description: >
 *           Page size for a single request to RIDB. Must be an integer between 1
 *           and 50 (RIDB maximum). Defaults to **50** when not provided.
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
 *         name: getAll
 *         required: false
 *         description: >
 *           When true, this endpoint will page through the RIDB /activities API and
 *           return **all** activities in a single response. In this mode, the
 *           `limit` and `offset` query parameters are ignored, even if provided
 *           (including when Swagger UI shows default values of 50 and 0).
 *         schema:
 *           type: boolean
 *           example: false
 *           default: false
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
 *         description: Normalized attributes
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
        const rawGetAll = searchParams.get('getAll');
        const getAll = rawGetAll === 'true';
        const rawIncludeRaw = searchParams.get('includeRaw');
        const includeRaw = rawIncludeRaw === 'true';
        // Treat null or empty/whitespace as "no query filter"
        const rawQuery = searchParams.get('query');
        const query =
            rawQuery && rawQuery.trim() !== '' ? rawQuery.trim() : null;
        if (!process.env.RIDB_API_KEY) {
            return NextResponse.json(
                { error: 'Server misconfigured: missing RIDB_API_KEY' },
                { status: 500 }
            );
        }
        const headers = {
            accept: 'application/json',
            apikey: process.env.RIDB_API_KEY!,
        };

        // --- getAll mode: page through RIDB and return everything (optionally filtered by query) ---
        if (getAll) {
            const all: Attributes['RECDATA'] = [];
            let offset = 0;
            const limit = RIDB_PAGE_LIMIT;

            const rawMaxPages = searchParams.get('maxPages');
            const maxPages =
                Math.max(Number(rawMaxPages ?? MAX_PAGES_DEFAULT) || MAX_PAGES_DEFAULT, 1);

            for (let page = 0; page < maxPages; page++) {
                const url =
                    `${RIDB_BASE_URL}/${encodeURIComponent(id)}/attributes?limit=${limit}&offset=${offset}` +
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

                const parsed: Attributes = AttributesSchema.parse(json);
                const items = parsed.RECDATA ?? [];

                if (!items.length) {
                    break;
                }

                all.push(...items);

                // If we got fewer than a full page, we've hit the end.
                if (items.length < limit) {
                    break;
                }

                offset += limit;
            }
            return NextResponse.json({raw: all, normalized: normalizeAttributes(all)}, { status: 200 });
        }

        const rawLimit = searchParams.get('limit');
        let limit = RIDB_PAGE_LIMIT;
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

        const rawOffset = searchParams.get('offset');
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
        const url =
            `${RIDB_BASE_URL}/${encodeURIComponent(id)}/attributes?limit=${limit}&offset=${offset}` +
            (query ? `&query=${encodeURIComponent(query)}` : '');

        const response = await fetchWithTimeout(url, headers);

        if (!response.ok) {
            throw new Error(`RIDB API responded with ${response.status} ${response.statusText}`);
        }

        let json: unknown;

        try {
            json = await response.json();
        } catch {
            throw new Error('Invalid or incomplete JSON received from RIDB (campsite attributes)');
        }

        const parsed: Attributes = AttributesSchema.parse(json);
        const items = parsed.RECDATA ?? [];
        if(includeRaw) {
            return NextResponse.json({raw: items, normalized: normalizeAttributes(items)}, { status: 200 });
        }
        return NextResponse.json({normalized: normalizeAttributes(items)}, { status: 200 });
    } catch (error: unknown) {
        console.error('RIDB campsite attributes fetch error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch campsite attributes from RIDB',
                details: getErrorMessage(error),
            },
            { status: 500 }
        );
    }
}

