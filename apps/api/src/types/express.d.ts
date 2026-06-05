import type { UserRole } from "../common/enums";

/** The authenticated principal attached to the request by `authenticate`. */
export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
