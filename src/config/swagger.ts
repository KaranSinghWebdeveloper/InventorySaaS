import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Inventory SaaS API",
      version: "1.0.0",
      description: "REST API for a multi-tenant inventory management SaaS platform"
    },
    servers: [
      {
        url: "/api/v1",
        description: "API v1"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./src/routes/*.ts", "./src/routes/modules/*.ts"]
});
