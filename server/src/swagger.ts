import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import openapi from "./openapi.json" with { type: "json" };

/** Mount OpenAPI JSON + Swagger UI (reachable when SPA fallback is enabled). */
export function mountSwagger(app: Express): void {
  app.get("/api-docs.json", (_req, res) => {
    res.json(openapi);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openapi, {
      customSiteTitle: "Presight Users API",
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );
}
