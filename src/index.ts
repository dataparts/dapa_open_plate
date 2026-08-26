import express from "express";
import swaggerUi from "swagger-ui-express";

import router from "./router";
import swaggerSpec from "./swagger";

const app = express();

/**
 * ---------------------------------------------------------
 * Middleware
 * ---------------------------------------------------------
 */

// Parse JSON request bodies
app.use(express.json());

/**
 * ---------------------------------------------------------
 * API Routes
 * ---------------------------------------------------------
 */

app.use(router);

/**
 * ---------------------------------------------------------
 * Swagger Documentation
 * ---------------------------------------------------------
 */

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

/**
 * ---------------------------------------------------------
 * Server
 * ---------------------------------------------------------
 */

const PORT = process.env.PORT || 3000;

// Only start the server when this file is run directly.
// This prevents Jest/Supertest from opening another server.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(
            `Open Plate API running on http://localhost:${PORT}`
        );
        console.log(
            `Swagger UI available at http://localhost:${PORT}/docs`
        );
    });
}

export default app;