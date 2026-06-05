import type { PublicUser, UserRole } from "./domain";

/** Request payload for `POST /api/auth/register`. */
export interface RegisterInput {
  fullname: string;
  email: string;
  phoneNumber: string;
  password: string;
  district?: string;
  addressLine?: string;
  /**
   * Optional. Only honored when the request is made by an authenticated ADMIN
   * (Bearer token); otherwise the new account is always created as "USER".
   */
  role?: UserRole;
}

/** Request payload for `POST /api/auth/login`. */
export interface LoginInput {
  email: string;
  password: string;
}

/** Returned on successful register/login/refresh. The refresh token itself is
 *  delivered as an httpOnly cookie, so only the access token is in the body. */
export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  /** Access token lifetime in seconds (hint for clients to schedule refresh). */
  expiresIn: number;
}
