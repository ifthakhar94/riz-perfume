import { Router } from "express";

import { UserRole } from "../../common/enums";
import { validate } from "../../common/http/validate";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import { listUsers } from "./users.controller";
import { listUsersQuerySchema } from "./users.validation";

export const usersRouter: Router = Router();

usersRouter.get(
  "/",
  authenticate,
  requireRole(UserRole.ADMIN),
  validate({ query: listUsersQuerySchema }),
  asyncHandler(listUsers),
);
