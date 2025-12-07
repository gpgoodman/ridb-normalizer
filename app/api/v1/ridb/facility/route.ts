import { NextResponse } from 'next/server';
import { normalizeFacility } from '@/lib/normalize/normalizeFacility';
import { FacilitySchema } from "@/lib/schemas/facility";

export const dynamic = 'force-dynamic';

const RIDB_BASE_URL = 'https://ridb.recreation.gov/api/v1/facilities';
const FETCH_TIMEOUT_MS = 12_000;

function getErrorMessage(err: unknown): string {
    return err instanceof Error ? err.message : 'Unknown error';
}

function hasFacilityID(x: unknown): x is { FacilityID: unknown } {
    return typeof x === 'object' && x !== null && 'FacilityID' in x;
}

/**
 * @openapi
 * /api/v1/ridb/facility:
 *   get:
 *     tags:
 *       - Facilities
 *     summary: Fetch and normalize RIDB facility data.
 *     description: >
 *       Returns a normalized view of a single facility from the Recreation Information
 *       Database (RIDB). You can try this using a facility ID taken from a
 *       recreation.gov campground URL.
 *
 *       For example, the Mather Campground URL:
 *       https://www.recreation.gov/camping/campgrounds/232490
 *       has facility ID **232490**.
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
 *     responses:
 *       200:
 *         description: Normalized facility
 *       400:
 *         description: Missing ID
 *       500:
 *         description: RIDB error or server error
 */



export async function GET(request: Request) {
    try {
        // Query param: /api/facility?id=232490
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Missing required query parameter: id' },
                { status: 400 }
            );
        }

        if (!process.env.RIDB_API_KEY) {
            return NextResponse.json(
                { error: 'Server misconfigured: missing RIDB_API_KEY' },
                { status: 500 }
            );
        }

        const url = `${RIDB_BASE_URL}/${encodeURIComponent(id)}?full=true`;

        const ac = new AbortController();
        const to = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);

        let response: Response;
        try {
            response = await fetch(url, {
                headers: {
                    accept: 'application/json',
                    apikey: process.env.RIDB_API_KEY,
                },
                cache: 'no-store',
                signal: ac.signal,
            });
        } finally {
            clearTimeout(to);
        }

        if (!response.ok) {
            throw new Error(`RIDB API responded with ${response.status} ${response.statusText}`);
        }

        // Parse JSON robustly
        let data: unknown;
        try {
            data = await response.json();
        } catch {
            throw new Error('Invalid or incomplete JSON received from RIDB');
        }

        // Basic integrity check (RIDB sometimes truncates payloads)
        if (!hasFacilityID(data)) {
            throw new Error('Incomplete or malformed RIDB response (missing FacilityID)');
        }

        // Normalize and return
        const parsed = FacilitySchema.parse(data);
        const normalized = normalizeFacility(parsed);
        return NextResponse.json(normalized, { status: 200 });
    } catch (error: unknown) {
        console.error('RIDB fetch error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch facility from RIDB',
                details: getErrorMessage(error),
            },
            { status: 500 }
        );
    }
}
