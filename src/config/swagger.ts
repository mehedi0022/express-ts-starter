import swaggerJSDoc from "swagger-jsdoc";

import { config } from "./env.js";

const success = (description: string, schema?: object) => ({
  description,
  content: schema ? { "application/json": { schema } } : undefined,
});

const errorResponses = {
  "400": { $ref: "#/components/responses/ValidationError" },
  "401": { $ref: "#/components/responses/AuthenticationError" },
  "403": { $ref: "#/components/responses/AuthorizationError" },
  "404": { $ref: "#/components/responses/NotFoundError" },
  "409": { $ref: "#/components/responses/ConflictError" },
};

const idParameter = {
  name: "id",
  in: "path",
  required: true,
  description: "Positive numeric user ID.",
  schema: { type: "integer", minimum: 1 },
};

const cookieAuth = [{ cookieAuth: [] }];

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Express TS Starter API",
      version: "1.0.0",
      description: "API documentation for Express TS Starter",
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Current local server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "Session, password, and email verification endpoints",
      },
      {
        name: "Users",
        description:
          "Authenticated user and RBAC-protected user management endpoints",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description:
            "The httpOnly access-token cookie issued by login or refresh. Swagger UI sends it automatically for same-origin requests.",
        },
      },
      schemas: {
        Role: {
          type: "object",
          required: ["id", "key", "name", "rank", "isSystem"],
          properties: {
            id: { type: "integer", example: 2 },
            key: { type: "string", example: "admin" },
            name: { type: "string", example: "Administrator" },
            rank: { type: "integer", example: 100 },
            isSystem: { type: "boolean", example: true },
          },
        },
        User: {
          type: "object",
          required: [
            "id",
            "email",
            "userName",
            "fullName",
            "roleId",
            "role",
            "isActive",
            "emailVerifiedAt",
            "createdAt",
            "updatedAt",
          ],
          properties: {
            id: { type: "integer", example: 42 },
            email: {
              type: "string",
              format: "email",
              example: "ada@example.com",
            },
            userName: { type: "string", example: "ada" },
            fullName: {
              type: "string",
              nullable: true,
              example: "Ada Lovelace",
            },
            roleId: { type: "integer", example: 2 },
            role: { $ref: "#/components/schemas/Role" },
            isActive: { type: "boolean", example: true },
            emailVerifiedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AuthenticatedUser: {
          allOf: [
            { $ref: "#/components/schemas/User" },
            {
              type: "object",
              required: ["permissions"],
              properties: {
                permissions: {
                  type: "array",
                  items: { type: "string" },
                  example: ["users:read:any"],
                },
              },
            },
          ],
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
            rememberMe: { type: "boolean", default: false },
          },
        },
        RegisterRequest: {
          type: "object",
          additionalProperties: false,
          required: ["fullName", "email", "password"],
          properties: {
            userName: { type: "string", minLength: 3 },
            fullName: { type: "string", minLength: 4 },
            email: { type: "string", format: "email" },
            password: {
              type: "string",
              format: "password",
              minLength: 8,
              description:
                "Must contain uppercase, lowercase, number, and special character.",
            },
          },
        },
        LoginResponse: {
          type: "object",
          required: ["success", "message", "data"],
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful" },
            data: {
              type: "object",
              required: ["user"],
              properties: {
                user: { $ref: "#/components/schemas/AuthenticatedUser" },
              },
            },
          },
        },
        CreateUserRequest: {
          type: "object",
          additionalProperties: false,
          required: ["userName", "fullName", "email", "password", "roleId"],
          properties: {
            userName: { type: "string", minLength: 3 },
            fullName: { type: "string", minLength: 4 },
            email: { type: "string", format: "email" },
            password: {
              type: "string",
              format: "password",
              minLength: 8,
              description:
                "Must contain uppercase, lowercase, number, and special character.",
            },
            roleId: { type: "integer", minimum: 1 },
          },
        },
        UpdateUserRequest: {
          type: "object",
          additionalProperties: false,
          minProperties: 1,
          properties: {
            userName: { type: "string", minLength: 2, nullable: true },
            fullName: { type: "string", minLength: 3, nullable: true },
          },
        },
        ChangeUserRoleRequest: {
          type: "object",
          additionalProperties: false,
          required: ["roleId"],
          properties: { roleId: { type: "integer", minimum: 1 } },
        },
        ChangeUserStatusRequest: {
          type: "object",
          additionalProperties: false,
          required: ["isActive"],
          properties: { isActive: { type: "boolean" } },
        },
        ResetUserPasswordRequest: {
          type: "object",
          additionalProperties: false,
          required: ["newPassword"],
          properties: {
            newPassword: {
              type: "string",
              format: "password",
              minLength: 8,
              description:
                "Must contain uppercase, lowercase, number, and special character.",
            },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string", format: "password" },
            newPassword: { type: "string", format: "password", minLength: 8 },
          },
        },
        TokenRequest: {
          type: "object",
          required: ["token"],
          properties: { token: { type: "string" } },
        },
        EmailRequest: {
          type: "object",
          required: ["email"],
          properties: { email: { type: "string", format: "email" } },
        },
        PaginationMeta: {
          type: "object",
          required: ["page", "limit", "total", "totalPages"],
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            total: { type: "integer", example: 57 },
            totalPages: { type: "integer", example: 3 },
          },
        },
        ValidationError: {
          type: "object",
          required: ["success", "message", "code"],
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            code: { type: "string", example: "VALIDATION_ERROR" },
            requestId: { type: "string" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "body.email" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          required: ["success", "message", "code"],
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            code: { type: "string" },
            requestId: { type: "string" },
          },
        },
        UserResponse: {
          type: "object",
          required: ["success", "message", "data"],
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { $ref: "#/components/schemas/User" },
          },
        },
        UsersResponse: {
          type: "object",
          required: ["success", "message", "data", "meta"],
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/User" },
            },
            meta: { $ref: "#/components/schemas/PaginationMeta" },
          },
        },
        MessageResponse: {
          type: "object",
          required: ["success", "message"],
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
          },
        },
      },
      responses: {
        ValidationError: {
          description: "Request validation failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidationError" },
            },
          },
        },
        AuthenticationError: {
          description: "Authentication failed or access token is missing",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        AuthorizationError: {
          description:
            "Authenticated user lacks the required database-driven permission",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        ConflictError: {
          description: "Resource conflict",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    paths: {
      "/api/v1/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Sign in and set authentication cookies",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            "200": success(
              "Login successful; sets httpOnly accessToken and refresh-token cookies.",
              { $ref: "#/components/schemas/LoginResponse" },
            ),
            "400": errorResponses["400"],
            "401": errorResponses["401"],
          },
        },
      },
      "/api/v1/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register a customer account",
          description:
            "Creates an active account with the database CUSTOMER role. The role cannot be supplied by the request.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" },
              },
            },
          },
          responses: {
            "201": success("Registration successful", {
              $ref: "#/components/schemas/UserResponse",
            }),
            "400": errorResponses["400"],
            "409": errorResponses["409"],
          },
        },
      },
      "/api/v1/auth/refresh": {
        post: {
          tags: ["Authentication"],
          summary: "Rotate refresh token and issue a new access token",
          description:
            "Requires the configured refresh-token cookie. Sets new accessToken and refresh cookies.",
          responses: {
            "200": success("Token refreshed", {
              $ref: "#/components/schemas/MessageResponse",
            }),
            "401": errorResponses["401"],
          },
        },
      },
      "/api/v1/auth/logout": {
        post: {
          tags: ["Authentication"],
          summary: "Sign out the current refresh session",
          responses: {
            "200": success("Logout successful", {
              $ref: "#/components/schemas/MessageResponse",
            }),
          },
        },
      },
      "/api/v1/auth/logout-all": {
        post: {
          tags: ["Authentication"],
          summary: "Revoke all sessions for the authenticated user",
          security: cookieAuth,
          responses: {
            "200": success("All sessions revoked", {
              $ref: "#/components/schemas/MessageResponse",
            }),
            "401": errorResponses["401"],
          },
        },
      },
      "/api/v1/auth/forgot-password": {
        post: {
          tags: ["Authentication"],
          summary: "Request a password-reset email",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EmailRequest" },
              },
            },
          },
          responses: {
            "202": success("Password reset email request accepted", {
              $ref: "#/components/schemas/MessageResponse",
            }),
            "400": errorResponses["400"],
          },
        },
      },
      "/api/v1/auth/reset-password": {
        post: {
          tags: ["Authentication"],
          summary: "Reset a password using a one-time token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/TokenRequest" },
                    {
                      type: "object",
                      required: ["password"],
                      properties: {
                        password: {
                          type: "string",
                          format: "password",
                          minLength: 8,
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          responses: {
            "200": success("Password reset", {
              $ref: "#/components/schemas/MessageResponse",
            }),
            "400": errorResponses["400"],
            "401": errorResponses["401"],
          },
        },
      },
      "/api/v1/auth/change-password": {
        post: {
          tags: ["Authentication"],
          summary: "Change the authenticated user's password",
          security: cookieAuth,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChangePasswordRequest" },
              },
            },
          },
          responses: {
            "200": success("Password changed", {
              $ref: "#/components/schemas/MessageResponse",
            }),
            "400": errorResponses["400"],
            "401": errorResponses["401"],
            "409": errorResponses["409"],
          },
        },
      },
      "/api/v1/auth/resend-verification": {
        post: {
          tags: ["Authentication"],
          summary: "Request a new email-verification message",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EmailRequest" },
              },
            },
          },
          responses: {
            "202": success("Verification email request accepted", {
              $ref: "#/components/schemas/MessageResponse",
            }),
            "400": errorResponses["400"],
          },
        },
      },
      "/api/v1/auth/verify-email": {
        post: {
          tags: ["Authentication"],
          summary: "Verify an email using a one-time token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TokenRequest" },
              },
            },
          },
          responses: {
            "200": success("Email verified", {
              $ref: "#/components/schemas/MessageResponse",
            }),
            "400": errorResponses["400"],
            "401": errorResponses["401"],
          },
        },
      },
      "/api/v1/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get the current authenticated user",
          security: cookieAuth,
          responses: {
            "200": success("Current user", {
              $ref: "#/components/schemas/UserResponse",
            }),
            "401": errorResponses["401"],
          },
        },
      },
      "/api/v1/users": {
        get: {
          tags: ["Users"],
          summary: "List users",
          description:
            "Requires the `users:read:any` permission. Authorization is resolved from Role → RolePermission → Permission.",
          security: cookieAuth,
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", minimum: 1, default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: {
                type: "integer",
                minimum: 1,
                maximum: 100,
                default: 20,
              },
            },
            {
              name: "sortOrder",
              in: "query",
              schema: {
                type: "string",
                enum: ["asc", "desc"],
                default: "desc",
              },
            },
            {
              name: "roleId",
              in: "query",
              schema: { type: "integer", minimum: 1 },
            },
            {
              name: "status",
              in: "query",
              schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
            },
            {
              name: "search",
              in: "query",
              schema: { type: "string", minLength: 1, maxLength: 100 },
            },
            {
              name: "sortBy",
              in: "query",
              schema: {
                type: "string",
                enum: [
                  "id",
                  "email",
                  "userName",
                  "fullName",
                  "roleId",
                  "createdAt",
                ],
                default: "createdAt",
              },
            },
          ],
          responses: {
            "200": success("Users", {
              $ref: "#/components/schemas/UsersResponse",
            }),
            ...errorResponses,
          },
        },
        post: {
          tags: ["Users"],
          summary: "Create a user",
          description:
            "Requires the `users:create` permission. Role hierarchy is enforced by the application.",
          security: cookieAuth,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateUserRequest" },
              },
            },
          },
          responses: {
            "201": success("User created", {
              $ref: "#/components/schemas/UserResponse",
            }),
            "400": errorResponses["400"],
            "401": errorResponses["401"],
            "403": errorResponses["403"],
            "409": errorResponses["409"],
          },
        },
      },
      "/api/v1/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Get a user by ID",
          description: "Requires the `users:read:any` permission.",
          security: cookieAuth,
          parameters: [idParameter],
          responses: {
            "200": success("User", {
              $ref: "#/components/schemas/UserResponse",
            }),
            ...errorResponses,
          },
        },
        patch: {
          tags: ["Users"],
          summary: "Update a user's profile",
          description:
            "Requires the `users:update:any` permission. Role hierarchy is enforced by the application.",
          security: cookieAuth,
          parameters: [idParameter],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateUserRequest" },
              },
            },
          },
          responses: {
            "200": success("User updated", {
              $ref: "#/components/schemas/UserResponse",
            }),
            ...errorResponses,
          },
        },
      },
      "/api/v1/users/{id}/role": {
        patch: {
          tags: ["Users"],
          summary: "Change a user's role",
          description:
            "Requires the `users:change-role` permission. Role hierarchy is enforced using Role.rank.",
          security: cookieAuth,
          parameters: [idParameter],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChangeUserRoleRequest" },
              },
            },
          },
          responses: {
            "200": success("Role updated", {
              $ref: "#/components/schemas/UserResponse",
            }),
            ...errorResponses,
          },
        },
      },
      "/api/v1/users/{id}/status": {
        patch: {
          tags: ["Users"],
          summary: "Change a user's active status",
          description:
            "Requires the `users:change-status` permission. Role hierarchy is enforced by the application.",
          security: cookieAuth,
          parameters: [idParameter],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ChangeUserStatusRequest",
                },
              },
            },
          },
          responses: {
            "200": success("Status updated", {
              $ref: "#/components/schemas/UserResponse",
            }),
            ...errorResponses,
          },
        },
      },
      "/api/v1/users/{id}/reset-password": {
        post: {
          tags: ["Users"],
          summary: "Reset a user's password",
          description:
            "Requires the `users:reset-password` permission. Existing sessions are revoked.",
          security: cookieAuth,
          parameters: [idParameter],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ResetUserPasswordRequest",
                },
              },
            },
          },
          responses: {
            "200": success("Password reset", {
              $ref: "#/components/schemas/MessageResponse",
            }),
            ...errorResponses,
          },
        },
      },
    },
  },
  apis: [],
});
