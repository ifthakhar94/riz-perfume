import type { CookieOptions, Request, Response } from "express";

import type { ApiSuccess, AuthResult, PublicUser } from "@riz/shared";

import { env, isProduction } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { authService, type IssuedSession, type RequestContext } from "./auth.service";

const REFRESH_COOKIE = env.REFRESH_COOKIE_NAME;
// Scope the refresh cookie to the auth routes only — it is never sent elsewhere.
const REFRESH_COOKIE_PATH = "/api/auth";

const refreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: REFRESH_COOKIE_PATH,
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
});

const contextFrom = (req: Request): RequestContext => ({
  userAgent: req.headers["user-agent"] ?? null,
  ipAddress: req.ip ?? null,
});

/** Set the refresh cookie and write the access token + user to the response. */
const sendSession = (res: Response, session: IssuedSession, status: number): void => {
  res.cookie(REFRESH_COOKIE, session.refreshToken, refreshCookieOptions());
  const body: ApiSuccess<AuthResult> = {
    success: true,
    data: {
      user: session.user,
      accessToken: session.accessToken,
      expiresIn: session.expiresIn,
    },
  };
  res.status(status).json(body);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  // req.user is populated by `optionalAuthenticate` only when a valid token is sent.
  const session = await authService.register(req.body, contextFrom(req), req.user?.role);
  sendSession(res, session, 201);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const session = await authService.login(req.body, contextFrom(req));
  sendSession(res, session, 200);
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token: unknown = req.cookies?.[REFRESH_COOKIE];
  if (typeof token !== "string") {
    throw AppError.unauthorized("No refresh token provided");
  }
  const session = await authService.refresh(token, contextFrom(req));
  sendSession(res, session, 200);
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const token: unknown = req.cookies?.[REFRESH_COOKIE];
  await authService.logout(typeof token === "string" ? token : undefined);
  res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  res.status(200).json({ success: true, data: { message: "Logged out" } });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await authService.getProfile(req.user.id);
  const body: ApiSuccess<PublicUser> = { success: true, data: user };
  res.status(200).json(body);
};
