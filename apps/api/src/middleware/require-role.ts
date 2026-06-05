import type { NextFunction, Request, Response } from "express";

import type { UserRole } from "../common/enums";
import { AppError } from "../utils/app-error";

/**
 * Role-based access guard. Use after `authenticate`:
 *   router.post("/", authenticate, requireRole(UserRole.ADMIN), handler)
 */
export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden("You do not have permission to perform this action"));
      return;
    }
    next();
  };
