import { createHash, randomBytes } from "node:crypto";

/** Generate a high-entropy opaque refresh token (sent to the client as a cookie). */
export const generateRefreshToken = (): string => randomBytes(48).toString("hex");

/**
 * Hash a refresh token before persisting. We store only the SHA-256 hash so a
 * database leak does not expose usable tokens (the raw value lives only in the
 * client's httpOnly cookie).
 */
export const hashRefreshToken = (raw: string): string =>
  createHash("sha256").update(raw).digest("hex");
