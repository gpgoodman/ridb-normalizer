// app/api/docs/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), "openapi.json");
        const raw = await fs.readFile(filePath, "utf-8");
        const spec = JSON.parse(raw);
        return NextResponse.json(spec);
    } catch (err) {
        console.error("Failed to read openapi.json:", err);
        return NextResponse.json(
            { error: "OpenAPI spec not available" },
            { status: 500 }
        );
    }
}
