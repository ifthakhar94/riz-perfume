import { Router } from "express";

import { UserRole } from "../../common/enums";
import { idParamSchema } from "../../common/http/params";
import { validate } from "../../common/http/validate";
import { authenticate, optionalAuthenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import * as orders from "./orders.controller";
import {
  createOrderSchema,
  listOrdersQuerySchema,
  updateDeliverySchema,
  updateOrderStatusSchema,
} from "./orders.validation";

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

export const ordersRouter: Router = Router();

// Public checkout — guest-capable; attaches userId when a valid token is sent.
ordersRouter.post(
  "/",
  optionalAuthenticate,
  validate({ body: createOrderSchema }),
  asyncHandler(orders.createOrder),
);

// Admin management
ordersRouter.get(
  "/",
  ...adminOnly,
  validate({ query: listOrdersQuerySchema }),
  asyncHandler(orders.listOrders),
);
ordersRouter.get(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(orders.getOrder),
);
ordersRouter.patch(
  "/:id/status",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateOrderStatusSchema }),
  asyncHandler(orders.updateOrderStatus),
);
ordersRouter.patch(
  "/:id/delivery",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateDeliverySchema }),
  asyncHandler(orders.updateOrderDelivery),
);
