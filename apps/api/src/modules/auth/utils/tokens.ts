import jwt from "jsonwebtoken";

import { parseDurationToSeconds } from "../../../common/duration";
import type { UserRole } from "../../../common/enums";
import { env } from "../../../config/env";

export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: UserRole;
}

/** Access token lifetime in seconds — also surfaced to clients in AuthResult. */
export const accessTokenTtlSeconds = parseDurationToSeconds(env.JWT_ACCESS_EXPIRES_IN);

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: accessTokenTtlSeconds });

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (typeof decoded === "string") {
    throw new jwt.JsonWebTokenError("Unexpected token payload");
  }
  return decoded as AccessTokenPayload & jwt.JwtPayload;
};
