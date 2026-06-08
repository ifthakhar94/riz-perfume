import { Router } from "express";

import { UserRole } from "../../common/enums";
import { idParamSchema } from "../../common/http/params";
import { validate } from "../../common/http/validate";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import * as courierCharges from "./courier-charges.controller";
import {
  createCourierChargeSchema,
  listCourierChargesQuerySchema,
  updateCourierChargeSchema,
} from "./courier-charges.validation";

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

export const courierChargesRouter: Router = Router();

// Public read so the storefront checkout can show delivery charges.
courierChargesRouter.get(
  "/",
  validate({ query: listCourierChargesQuerySchema }),
  asyncHandler(courierCharges.listCourierCharges),
);
courierChargesRouter.post(
  "/",
  ...adminOnly,
  validate({ body: createCourierChargeSchema }),
  asyncHandler(courierCharges.createCourierCharge),
);
courierChargesRouter.patch(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateCourierChargeSchema }),
  asyncHandler(courierCharges.updateCourierCharge),
);
courierChargesRouter.delete(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(courierCharges.deleteCourierCharge),
);
