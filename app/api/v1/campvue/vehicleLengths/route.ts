import {Campsite} from "@/lib/schemas/campsite";

export const dynamic = 'force-dynamic';
import {NextResponse} from 'next/server';
import {normalizeMaxLengths} from "@/lib/normalize/campvue/normalizeMaxLengths";
import {RIDBCampsitesResponse, RIDBCampsitesResponseSchema} from "@/lib/schemas/campsites";
import {MaxLengths} from "@/lib/schemas/campvue/maxLength";

const RIDB_BASE_URL = 'https://ridb.recreation.gov/api/v1/facilities';
const FETCH_TIMEOUT_MS = 12_000;
const RIDB_PAGE_LIMIT = 50;
const RIDB_OFFSET = 0;
const MAX_PAGES_DEFAULT = 1000;

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

function getGreatestMaxLength(sites:MaxLengths = []) {
    let max = 0

    for (const site of sites) {
        const length = Number(site?.maxLength)

        if (Number.isFinite(length) && length > max) {
            max = length
        }
    }

    return max
}

/**
 * @openapi
 * /api/v1/campvue/vehicleLengths:
 *   get:
 *     tags:
 *       - Campvue
 *     summary: Fetch max vehicle lengths for a campground and each campsite.
 *     description: >
 *       Uses normalized campsite data by campground (dervied from RIDB) to reduce to a max vehicle length
 *       as well as exposes campsite lengths .
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
 *         name: isReservable
 *         required: false
 *         description: >
 *          filters by either reservable or non-reservable campsites. Is optional,
 *          and if not defined, returns all results
 *         schema:
 *           type: boolean
 *           example: false
 *     responses:
 *       200:
 *         description: Max vehicle lengths by campground and campsite
 *       400:
 *         description: Invalid query parameters (e.g. id)
 *       500:
 *         description: RIDB error or server error
 */


export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url);
        const id = searchParams.get('id');
        const rawIsReservable = searchParams.get('isReservable');
        let isReservable;

        if (rawIsReservable === 'true') {
            isReservable = true
        } else if (rawIsReservable === 'false') {
            isReservable = false
        } else {
            isReservable = undefined
        }

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

        const headers = {
            accept: 'application/json',
            apikey: process.env.RIDB_API_KEY!,
        };
        const all: RIDBCampsitesResponse['RECDATA'] = [];
        let offset = 0;
        const limit = RIDB_PAGE_LIMIT;

        for (let page = 0; page < MAX_PAGES_DEFAULT; page++) {
            const url =
                `${RIDB_BASE_URL}/${encodeURIComponent(id)}/campsites?limit=${limit}&offset=${offset}`;
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

            if (!items.length) {
                break;
            }

            let filteredItems;
            if (isReservable !== undefined) {
                filteredItems = items.filter(
                    c => c.CampsiteReservable === isReservable
                )
            }
            if(filteredItems) {
                all.push(...filteredItems);
            } else {
                all.push(...items);
            }


            offset += limit;
        }
        const siteLengths = normalizeMaxLengths(all);
        const normalizedLength = {
            facilityId: id,
            maxLength: getGreatestMaxLength(siteLengths),
            sites: siteLengths
        }

        return NextResponse.json(normalizedLength, { status: 200 });


    }catch (error: unknown) {
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