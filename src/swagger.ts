import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Open Plate API",
            version: "1.0.0",
            description:
                "Universal File Naming API that converts raw filenames into standardized, machine-readable names.",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local Development Server",
            },
        ],
    },

    apis: ["./src/router.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;