import { Router } from "express";

import { UserRole } from "../../common/enums";
import { idParamSchema } from "../../common/http/params";
import { validate } from "../../common/http/validate";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import * as expenseCategories from "./expense-categories.controller";
import {
  createExpenseCategorySchema,
  listExpenseCategoriesQuerySchema,
  updateExpenseCategorySchema,
} from "./expense-categories.validation";

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

export const expenseCategoriesRouter: Router = Router();

expenseCategoriesRouter.get(
  "/",
  ...adminOnly,
  validate({ query: listExpenseCategoriesQuerySchema }),
  asyncHandler(expenseCategories.listExpenseCategories),
);
expenseCategoriesRouter.post(
  "/",
  ...adminOnly,
  validate({ body: createExpenseCategorySchema }),
  asyncHandler(expenseCategories.createExpenseCategory),
);
expenseCategoriesRouter.patch(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateExpenseCategorySchema }),
  asyncHandler(expenseCategories.updateExpenseCategory),
);
expenseCategoriesRouter.delete(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(expenseCategories.deleteExpenseCategory),
);
