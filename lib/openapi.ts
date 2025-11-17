import swaggerJsdoc from "swagger-jsdoc";

export const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "RIDB Normalizer API",
        version: "1.0.0",
        description:
            "API documentation for RIDB normalization endpoints used for Campvue and AI integrations.",
    },
    // Keep prod first so Swagger UI defaults to the live URL
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

export const swaggerOptions = {
    definition: swaggerDefinition,
    apis: [
        "./app/api/**/*.ts",
        "./app/api/**/*.js",
        "./pages/api/**/*.ts",
        "./pages/api/**/*.js",
    ],
};

export const openapiSpec = swaggerJsdoc(swaggerOptions);
