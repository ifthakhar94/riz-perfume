import { Router } from "express";

import { UserRole } from "../../common/enums";
import { idParamSchema } from "../../common/http/params";
import { validate } from "../../common/http/validate";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import * as products from "./products.controller";
import {
  createProductSchema,
  listProductsQuerySchema,
  slugParamSchema,
  updateProductSchema,
} from "./products.validation";

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

export const productsRouter: Router = Router();

// Public
productsRouter.get(
  "/",
  validate({ query: listProductsQuerySchema }),
  asyncHandler(products.listProducts),
);

// Admin: fetch any product (incl. inactive) by id — declared before "/:slug".
productsRouter.get(
  "/by-id/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(products.getProductById),
);

productsRouter.get(
  "/:slug",
  validate({ params: slugParamSchema }),
  asyncHandler(products.getProductBySlug),
);

// Admin writes
productsRouter.post(
  "/",
  ...adminOnly,
  validate({ body: createProductSchema }),
  asyncHandler(products.createProduct),
);
productsRouter.patch(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateProductSchema }),
  asyncHandler(products.updateProduct),
);
productsRouter.delete(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(products.deleteProduct),
);
