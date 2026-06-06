import { Router } from "express";

import { UserRole } from "../../common/enums";
import { idParamSchema } from "../../common/http/params";
import { validate } from "../../common/http/validate";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import * as categories from "./categories.controller";
import {
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from "./categories.validation";

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

export const categoriesRouter: Router = Router();

categoriesRouter.get(
  "/",
  validate({ query: listCategoriesQuerySchema }),
  asyncHandler(categories.listCategories),
);
categoriesRouter.post(
  "/",
  ...adminOnly,
  validate({ body: createCategorySchema }),
  asyncHandler(categories.createCategory),
);
categoriesRouter.patch(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateCategorySchema }),
  asyncHandler(categories.updateCategory),
);
categoriesRouter.delete(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(categories.deleteCategory),
);
