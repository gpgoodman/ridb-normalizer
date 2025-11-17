import swaggerJsdoc from "swagger-jsdoc";
import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) Base OpenAPI metadata
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "RIDB Normalizer API",
        version: "1.0.0",
        description:
            "API documentation for RIDB normalization endpoints used for Campvue and AI integrations.",
    },
    servers: [
        {
            url: "https://ridb-normalizer.vercel.app",
            description: "Production server",
        },
        {
            url: "http://localhost:3000",
            description: "Local dev server",
        },
    ],
    tags: [
        {
            name: 'Activities',
            description:
                'Activities are normalized from the RIDB /activities and /facilities/{id}/activities endpoints.',
        },
        {
            name: 'Facilities',
            description:
                'Facilities and related metadata normalized from the RIDB /facilities endpoints.',
        },
    ],
};

// 2) Where swagger-jsdoc should look for JSDoc comments
const swaggerOptions = {
    definition: swaggerDefinition,
    apis: [
        "./app/api/**/*.ts",
        "./app/api/**/*.js",
        "./pages/api/**/*.ts",
        "./pages/api/**/*.js",
    ],
};

// 3) Generate the spec
const spec = swaggerJsdoc(swaggerOptions);

// 4) Write to openapi.json at project root
const outPath = path.join(__dirname, "..", "openapi.json");

await writeFile(outPath, JSON.stringify(spec, null, 2), "utf-8");
console.log(`✅ OpenAPI spec written to ${outPath}`);
