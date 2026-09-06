import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config/env.js";

const validEnvironment = {
  NODE_ENV: "development",
  DATABASE_URL: "postgresql://app:password@localhost:5432/starter",
  JWT_ACCESS_SECRET: "access-secret-that-is-at-least-32-characters",
  JWT_REFRESH_SECRET: "refresh-secret-that-is-at-least-32-characters",
};

describe("application configuration", () => {
  it("loads optional integrations as disabled without credentials", () => {
    const config = loadConfig(validEnvironment);
    expect(config.smtp.enabled).toBe(false);
    expect(config.cloudinary.enabled).toBe(false);
    expect(config.database.migrationUrl).toBe(config.database.runtimeUrl);
  });

  it("supports separate migration credentials", () => {
    const config = loadConfig({ ...validEnvironment, DATABASE_MIGRATION_URL: "postgresql://admin:password@localhost:5432/starter" });
    expect(config.database.migrationUrl).not.toBe(config.database.runtimeUrl);
  });

  it("requires verified database TLS in production", () => {
    expect(() => loadConfig({ ...validEnvironment, NODE_ENV: "production" })).toThrow("DATABASE_TLS_MODE");
  });

  it("rejects ambiguous TLS query parameters", () => {
    expect(() => loadConfig({ ...validEnvironment, DATABASE_URL: `${validEnvironment.DATABASE_URL}?sslmode=require` })).toThrow("TLS query parameters are not supported");
  });

  it("requires secure cookies for SameSite=None", () => {
    expect(() => loadConfig({ ...validEnvironment, COOKIE_SAME_SITE: "none", COOKIE_SECURE: "false" })).toThrow("COOKIE_SECURE");
  });

  it("rejects URL-shaped cookie domains", () => {
    expect(() => loadConfig({ ...validEnvironment, COOKIE_DOMAIN: "https://example.com" }))
      .toThrow("COOKIE_DOMAIN");
  });

  it("requires a valid Redis URL only when the Redis limiter store is enabled", () => {
    expect(() => loadConfig({ ...validEnvironment, RATE_LIMIT_STORE: "redis" }))
      .toThrow("REDIS_URL");
    expect(loadConfig({
      ...validEnvironment,
      RATE_LIMIT_STORE: "redis",
      REDIS_URL: "rediss://default:secret@redis.example.com:6379",
    }).rateLimit.store).toBe("redis");
  });

  it("rejects wildcard and non-origin CORS entries", () => {
    expect(() => loadConfig({ ...validEnvironment, CORS_ORIGINS: "*" }))
      .toThrow("wildcard");
    expect(() => loadConfig({ ...validEnvironment, CORS_ORIGINS: "https://example.com/path" }))
      .toThrow("must be origins");
  });

  it("parses an explicit proxy hop and rejects trust-all in production", () => {
    expect(loadConfig({ ...validEnvironment, TRUST_PROXY: "1" }).trustProxy)
      .toBe(1);
    expect(() => loadConfig({
      ...validEnvironment,
      NODE_ENV: "production",
      DATABASE_TLS_MODE: "verify-full",
      COOKIE_SECURE: "true",
      TRUST_PROXY: "true",
    })).toThrow("TRUST_PROXY");
  });
});
