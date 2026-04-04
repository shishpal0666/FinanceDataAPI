const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title:       "Finance Dashboard API",
      version:     "1.0.0",
      description: "Role-based finance data processing backend",
    },
    servers: [{ url: "http://localhost:5000/api" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:   "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        FinancialRecord: {
          type: "object",
          properties: {
            _id:         { type: "string", example: "665f1a..." },
            amount:      { type: "number", example: 1500 },
            type:        { type: "string", enum: ["income", "expense"] },
            category:    { type: "string", example: "Salary" },
            date:        { type: "string", format: "date-time" },
            description: { type: "string", example: "Monthly salary" },
            createdBy:   { type: "object", properties: { name: { type: "string" }, email: { type: "string" } } },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors:  { type: "array", items: { type: "object",
              properties: { field: { type: "string" }, message: { type: "string" } } } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Scan all route files for JSDoc comments
  apis: ["./src/modules/**/*.routes.js"],
};

module.exports = swaggerJsdoc(options);
