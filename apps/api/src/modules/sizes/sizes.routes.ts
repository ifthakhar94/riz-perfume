import { Router } from "express";

import { UserRole } from "../../common/enums";
import { idParamSchema } from "../../common/http/params";
import { validate } from "../../common/http/validate";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import * as sizes from "./sizes.controller";
import { createSizeSchema, updateSizeSchema } from "./sizes.validation";

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

export const sizesRouter: Router = Router();

sizesRouter.get("/", asyncHandler(sizes.listSizes));
sizesRouter.post(
  "/",
  ...adminOnly,
  validate({ body: createSizeSchema }),
  asyncHandler(sizes.createSize),
);
sizesRouter.patch(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateSizeSchema }),
  asyncHandler(sizes.updateSize),
);
sizesRouter.delete(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(sizes.deleteSize),
);
