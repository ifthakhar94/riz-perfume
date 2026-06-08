import { Router } from "express";

import { UserRole } from "../../common/enums";
import { idParamSchema } from "../../common/http/params";
import { validate } from "../../common/http/validate";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import * as investments from "./investments.controller";
import {
  createInvestmentSchema,
  listInvestmentsQuerySchema,
  updateInvestmentSchema,
} from "./investments.validation";

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

export const investmentsRouter: Router = Router();

investmentsRouter.get(
  "/",
  ...adminOnly,
  validate({ query: listInvestmentsQuerySchema }),
  asyncHandler(investments.listInvestments),
);
investmentsRouter.post(
  "/",
  ...adminOnly,
  validate({ body: createInvestmentSchema }),
  asyncHandler(investments.createInvestment),
);
investmentsRouter.patch(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateInvestmentSchema }),
  asyncHandler(investments.updateInvestment),
);
investmentsRouter.delete(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(investments.deleteInvestment),
);
