import { Router } from "express";

import { UserRole } from "../../common/enums";
import { idParamSchema } from "../../common/http/params";
import { validate } from "../../common/http/validate";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import * as offers from "./offers.controller";
import { createOfferSchema, updateOfferSchema } from "./offers.validation";

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

export const offersRouter: Router = Router();

// Public: active offers (e.g. storefront banners).
offersRouter.get("/active", asyncHandler(offers.listActiveOffers));

// Admin management
offersRouter.get("/", ...adminOnly, asyncHandler(offers.listOffers));
offersRouter.post(
  "/",
  ...adminOnly,
  validate({ body: createOfferSchema }),
  asyncHandler(offers.createOffer),
);
offersRouter.patch(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateOfferSchema }),
  asyncHandler(offers.updateOffer),
);
offersRouter.delete(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(offers.deleteOffer),
);
