import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { router } from "./router";

function resolvePort(): number {
  return Number(process.env.PORT ?? 3000);
}

function buildSwaggerSpec(port: number) {
  return swaggerJsdoc({
    definition: {
      openapi: "3.0.3",
      info: {
        title: "plate API",
        version: "1.0.0",
        description: "REST API for generating standardized file names and storing them in SQLite."
      },
      servers: [{ url: `http://localhost:${port}` }]
    },
    apis: [
      `${process.cwd()}/src/router.ts`,
      `${process.cwd()}/dist/src/router.js`
    ]
  });
}

export function createApp() {
  const app = express();
  const port = resolvePort();

  app.use(express.json());
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(buildSwaggerSpec(port)));
  app.use("/api/v1", router);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = resolvePort();
  app.listen(port, () => {
    console.log(`plate API listening on port ${port}`);
  });
}
