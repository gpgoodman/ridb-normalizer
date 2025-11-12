import { NextResponse } from 'next/server';
import {Activities, ActivitiesSchema} from "@/lib/schemas/activities";

export const dynamic = 'force-dynamic';

const RIDB_BASE_URL = 'https://ridb.recreation.gov/api/v1/facilities';
const FETCH_TIMEOUT_MS = 12_000;
const RIDB_PAGE_LIMIT = 50; // RIDB max

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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id'); // /api/activities?id=232490
        if (!id) {
            return NextResponse.json({ error: 'Missing required query parameter: id' }, { status: 400 });
        }

        if (!process.env.RIDB_API_KEY) {
            return NextResponse.json(
                { error: 'Server misconfigured: missing RIDB_API_KEY' },
                { status: 500 }
            );
        }

        // Optional overrides for debugging (safe defaults)
        const limit = Math.min(
            Number(searchParams.get('limit') ?? RIDB_PAGE_LIMIT) || RIDB_PAGE_LIMIT,
            RIDB_PAGE_LIMIT
        );
        const maxPages = Math.max(Number(searchParams.get('maxPages') ?? 10) || 10, 1); // safety valve

        const headers = {
            accept: 'application/json',
            apikey: process.env.RIDB_API_KEY!,
    };

        let offset = Number(searchParams.get('offset') ?? 0) || 0;
        const all: Activities['RECDATA'] = [];
        let totalCount: number | null = null;

        for (let page = 0; page < maxPages; page++) {
            const url =
                `${RIDB_BASE_URL}/${encodeURIComponent(id)}/activities?limit=${limit}&offset=${offset}`;

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

            const parsed = ActivitiesSchema.parse(json);
            const items = parsed.RECDATA ?? [];
            all.push(...items);

            const meta = parsed.METADATA?.RESULTS;
            if (meta?.TOTAL_COUNT != null) {
                totalCount = meta.TOTAL_COUNT;
            }

            // Stop if we fetched fewer than limit (last page) or there were no items
            if (items.length < limit) break;

            offset += limit;
        }

        return NextResponse.json(
            {
                facilityId: id,
                total: totalCount ?? all.length,
                fetched: all.length,
                limit,
                activities: all, // raw RIDB activity records (validated minimally)
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('RIDB activities fetch error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch activities from RIDB',
                details: getErrorMessage(error),
            },
            { status: 500 }
        );
    }
}
