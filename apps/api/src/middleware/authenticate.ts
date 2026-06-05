import type { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { verifyAccessToken } from "../modules/auth/utils/tokens";
import { AppError } from "../utils/app-error";

/**
 * Require a valid Bearer access token. On success, attaches `req.user`.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(AppError.unauthorized("Missing or malformed Authorization header"));
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      next(AppError.unauthorized("Access token expired"));
      return;
    }
    if (err instanceof JsonWebTokenError) {
      next(AppError.unauthorized("Invalid access token"));
      return;
    }
    next(err);
  }
};

/**
 * Attach `req.user` when a valid Bearer token is present, but allow anonymous
 * requests through. Used by endpoints that behave differently for admins
 * (e.g. registration accepting an elevated role only from an admin caller).
 */
export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyAccessToken(header.slice("Bearer ".length).trim());
      req.user = { id: payload.sub, email: payload.email, role: payload.role };
    } catch {
      // Ignore invalid/expired tokens here — treat the caller as anonymous.
    }
  }
  next();
};
