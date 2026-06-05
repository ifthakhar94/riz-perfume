import { describe, expect, it } from "vitest";

import { parseDurationToSeconds } from "../../common/duration";
import { UserRole } from "../../common/enums";
import { hashPassword, verifyPassword } from "./utils/password";
import { accessTokenTtlSeconds, signAccessToken, verifyAccessToken } from "./utils/tokens";

describe("parseDurationToSeconds", () => {
  it("parses each unit", () => {
    expect(parseDurationToSeconds("30s")).toBe(30);
    expect(parseDurationToSeconds("15m")).toBe(900);
    expect(parseDurationToSeconds("2h")).toBe(7200);
    expect(parseDurationToSeconds("7d")).toBe(604800);
  });

  it("throws on malformed input", () => {
    expect(() => parseDurationToSeconds("nope")).toThrow();
  });
});

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(hash).not.toBe("Sup3rSecret!");
    expect(await verifyPassword("Sup3rSecret!", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});

describe("access tokens", () => {
  it("signs and verifies a payload round-trip", () => {
    const token = signAccessToken({ sub: 42, email: "admin@rizperfume.com", role: UserRole.ADMIN });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe(42);
    expect(payload.email).toBe("admin@rizperfume.com");
    expect(payload.role).toBe(UserRole.ADMIN);
    expect(accessTokenTtlSeconds).toBeGreaterThan(0);
  });

  it("rejects a tampered token", () => {
    expect(() => verifyAccessToken("not.a.valid.jwt")).toThrow();
  });
});
