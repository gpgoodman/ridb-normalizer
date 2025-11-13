import { NextResponse } from "next/server";
import {openapiSpec} from "../../../lib/openapi";

export function GET() {
    return NextResponse.json(openapiSpec);
}
