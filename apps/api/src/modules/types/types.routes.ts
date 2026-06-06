import { Router } from "express";

import { UserRole } from "../../common/enums";
import { idParamSchema } from "../../common/http/params";
import { validate } from "../../common/http/validate";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import * as types from "./types.controller";
import { createTypeSchema, updateTypeSchema } from "./types.validation";

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

export const typesRouter: Router = Router();

typesRouter.get("/", asyncHandler(types.listTypes));
typesRouter.post(
  "/",
  ...adminOnly,
  validate({ body: createTypeSchema }),
  asyncHandler(types.createType),
);
typesRouter.patch(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateTypeSchema }),
  asyncHandler(types.updateType),
);
typesRouter.delete(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(types.deleteType),
);
