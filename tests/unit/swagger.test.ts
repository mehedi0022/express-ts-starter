import { describe, expect, it } from "vitest";

import { swaggerSpec } from "../../src/config/swagger.js";

describe("Swagger specification", () => {
  it("documents the current API routes and cookie authentication", () => {
    expect(swaggerSpec.openapi).toBe("3.0.3");
    expect(swaggerSpec.paths).toHaveProperty("/api/v1/auth/login");
    expect(swaggerSpec.paths).toHaveProperty("/api/v1/users");
    expect(swaggerSpec.components?.securitySchemes?.cookieAuth).toMatchObject({
      type: "apiKey",
      in: "cookie",
      name: "accessToken",
    });
  });
});
