import swaggerJsdoc from "swagger-jsdoc";

export const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "RIDB Normalizer API",
        version: "1.0.0",
        description:
            "API documentation for RIDB normalization endpoints used for Campvue and AI integrations.",
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Local dev server",
        },
        {
            url: "https://YOUR_DEPLOYED_URL", // replace later
            description: "Production server",
        },
    ],
};

export const swaggerOptions = {
    swaggerDefinition,
    // All files where you write Swagger docs in JSDoc
    apis: ["./app/api/**/*.ts"],
};

export const openapiSpec = swaggerJsdoc(swaggerOptions);
