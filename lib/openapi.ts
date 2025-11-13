import swaggerJsdoc from "swagger-jsdoc";

export const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "RIDB Normalizer API",
        version: "1.0.0",
        description:
            "API documentation for RIDB normalization endpoints used for Campvue and AI integrations.",
    },
    // Put PROD first so Swagger UI defaults to the live URL
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
};

// In dev, we can read the TS source.
// In production on Vercel, only the compiled JS in .next/server is available.
const apiFileGlobs =
    process.env.NODE_ENV === "production"
        ? [
            "./.next/server/app/api/**/*.js", // App Router API routes (compiled)
            "./.next/server/pages/api/**/*.js", // Pages API routes (if you ever add them)
        ]
        : [
            "./app/api/**/*.ts",
            "./app/api/**/*.js",
            "./pages/api/**/*.ts",
            "./pages/api/**/*.js",
        ];

export const swaggerOptions = {
    definition: swaggerDefinition,
    apis: apiFileGlobs,
};

export const openapiSpec = swaggerJsdoc(swaggerOptions);
