import { Router } from "express";

import { UserRole } from "../../common/enums";
import { idParamSchema } from "../../common/http/params";
import { validate } from "../../common/http/validate";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import * as variants from "./variants.controller";
import {
  createVariantSchema,
  listVariantsQuerySchema,
  updateVariantSchema,
} from "./variants.validation";

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

// Variants are managed by admins only; the public sees them via product detail.
export const variantsRouter: Router = Router();

variantsRouter.get(
  "/",
  ...adminOnly,
  validate({ query: listVariantsQuerySchema }),
  asyncHandler(variants.listVariants),
);
variantsRouter.post(
  "/",
  ...adminOnly,
  validate({ body: createVariantSchema }),
  asyncHandler(variants.createVariant),
);
variantsRouter.patch(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateVariantSchema }),
  asyncHandler(variants.updateVariant),
);
variantsRouter.delete(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(variants.deleteVariant),
);
