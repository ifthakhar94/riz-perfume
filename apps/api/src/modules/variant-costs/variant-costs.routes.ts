import { Router } from "express";

import { UserRole } from "../../common/enums";
import { idParamSchema } from "../../common/http/params";
import { validate } from "../../common/http/validate";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import * as variantCosts from "./variant-costs.controller";
import {
  createVariantCostSchema,
  listVariantCostsQuerySchema,
  updateVariantCostSchema,
} from "./variant-costs.validation";

// Internal cost data — admin only, never public.
const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

export const variantCostsRouter: Router = Router();

variantCostsRouter.get(
  "/",
  ...adminOnly,
  validate({ query: listVariantCostsQuerySchema }),
  asyncHandler(variantCosts.listVariantCosts),
);
variantCostsRouter.post(
  "/",
  ...adminOnly,
  validate({ body: createVariantCostSchema }),
  asyncHandler(variantCosts.createVariantCost),
);
variantCostsRouter.patch(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateVariantCostSchema }),
  asyncHandler(variantCosts.updateVariantCost),
);
variantCostsRouter.delete(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(variantCosts.deleteVariantCost),
);
