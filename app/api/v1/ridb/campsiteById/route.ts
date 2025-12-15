import {NextResponse} from "next/server";
import {normalizeCampsite} from "@/lib/normalize/normalizeCampsite";
import {Campsite, CampsiteSchema} from "@/lib/schemas/campsite";


export const dynamic = 'force-dynamic';

const RIDB_BASE_URL = 'https://ridb.recreation.gov/api/v1/campsites/';

const FETCH_TIMEOUT_MS = 12_000;

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
 * /api/v1/ridb/campsiteById:
 *   get:
 *     tags:
 *       - Campsites
 *     summary: Fetch and normalize RIDB campsite data.
 *     description: >
 *       Returns a normalized view of a single campsite from the Recreation Information
 *       Database (RIDB).
 *
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: >
 *           RIDB CampsiteID (numeric ID from the recreation.gov list of attributes),
 *           e.g. **4000** for site 46 at North Rim Campground at Grand Canyon.
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Normalized campsite
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
                {error: "Missing required query parameter: 'id'"},
                {status: 400}
            );
        }
        if (!process.env.RIDB_API_KEY) {
            return NextResponse.json(
                {error: 'Server misconfigured: missing RIDB_API_KEY'},
                {status: 500}
            );
        }
        const headers = {
            accept: 'application/json',
            apikey: process.env.RIDB_API_KEY!,
        };
        const url =
            `${RIDB_BASE_URL}/${encodeURIComponent(id)}`;

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

        const parsed: Campsite = CampsiteSchema.parse(json);
        return NextResponse.json({normalized: normalizeCampsite(parsed)}, { status: 200 });

    } catch (error: unknown) {
        console.error('RIDB campsite attributes fetch error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch campsite attributes from RIDB',
                details: getErrorMessage(error),
            },
            {status: 500}
        );
    }
}