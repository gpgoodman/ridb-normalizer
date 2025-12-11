import { NextResponse } from 'next/server';
import { ActivitySchema } from "@/lib/schemas/activities";
import { normalizeActivity } from "@/lib/normalize/normalizeActivity";

export const dynamic = 'force-dynamic';

const RIDB_BASE_URL = 'https://ridb.recreation.gov/api/v1/activities';
const FETCH_TIMEOUT_MS = 12_000;

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
 * /api/v1/ridb/activityById:
 *   get:
 *     tags:
 *       - Activities
 *     summary: Fetch and normalize RIDB a single activity's data.
 *     description: >
 *       Returns a normalized view of a single activity by activity id from the Recreation Information
 *       Database (RIDB). You need an activity id to use this api, e.g. 4, 50, 75...  ids are easily obtained from
 *       the list of all activities here at /activities or via the RIDB endpoint.
 *
 *       For example, the RIDB activities endpoint exposes:
 *       {
 *        "ActivityID": 4,
 *        "ActivityLevel": 0,
 *        "ActivityName": "AUTO TOURING",
 *        "ActivityParentID": 0
 *       }
 *       and has activity ID **4**.
 *
 *       This endpoint returns one activity by id at a time. No paging required.  If an activity by id is not found, note the 404 spec below.
 *
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: >
 *           RIDB ActivityID (numeric ID from the recreation.gov list of activities),
 *           e.g. **4** for Auto Touring.
 *         schema:
 *           type: string
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
 *         description: Normalized activities by activity id
 *       400:
 *         description: Missing id
 *       404:
 *         description: Activity not found (RIDB returned id 0 and empty name)
 *       500:
 *         description: RIDB error or server error
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id'); // /api/activityById?id=4

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

        const headers = {
            accept: 'application/json',
            apikey: process.env.RIDB_API_KEY!,
        };
        const rawIncludeRaw = searchParams.get('includeRaw');
        const includeRaw = rawIncludeRaw === 'true';
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
            throw new Error('Invalid or incomplete JSON received from RIDB (activityById)');
        }

        const parsed =  ActivitySchema.parse(json);

        const normalized = normalizeActivity(parsed);

        if (normalized.id === 0 && !normalized.name) {
            return NextResponse.json(
                { error: `Activity with id '${id}' not found in RIDB` },
                { status: 404 }
            );
        }

        if(includeRaw) {
            return NextResponse.json({raw:parsed, normalized}, { status: 200 });
        }

        return NextResponse.json({normalized}, { status: 200 });
    } catch (error: unknown) {
        console.error('RIDB activityById fetch error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch activityById from RIDB',
                details: getErrorMessage(error),
            },
            { status: 500 }
        );
    }
}
