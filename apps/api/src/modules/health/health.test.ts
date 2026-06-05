import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../app";

const app = createApp();

describe("GET /api/health", () => {
  it("returns a well-formed health payload", async () => {
    const res = await request(app).get("/api/health");

    // 200 when the DB is reachable, 503 when degraded — both are valid here
    // since the test environment may not have a database connected.
    expect([200, 503]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe("riz-perfume-api");
    expect(["ok", "degraded", "down"]).toContain(res.body.data.status);
    expect(res.body.data.checks).toHaveProperty("database");
  });
});

describe("unknown routes", () => {
  it("returns the standard 404 error envelope", async () => {
    const res = await request(app).get("/api/this-route-does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
