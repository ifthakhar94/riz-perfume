import { Router } from "express";

import { UserRole } from "../../common/enums";
import { idParamSchema } from "../../common/http/params";
import { validate } from "../../common/http/validate";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { asyncHandler } from "../../utils/async-handler";
import * as expenses from "./expenses.controller";
import {
  createExpenseSchema,
  listExpensesQuerySchema,
  updateExpenseSchema,
} from "./expenses.validation";

const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

export const expensesRouter: Router = Router();

expensesRouter.get(
  "/",
  ...adminOnly,
  validate({ query: listExpensesQuerySchema }),
  asyncHandler(expenses.listExpenses),
);
expensesRouter.post(
  "/",
  ...adminOnly,
  validate({ body: createExpenseSchema }),
  asyncHandler(expenses.createExpense),
);
expensesRouter.patch(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema, body: updateExpenseSchema }),
  asyncHandler(expenses.updateExpense),
);
expensesRouter.delete(
  "/:id",
  ...adminOnly,
  validate({ params: idParamSchema }),
  asyncHandler(expenses.deleteExpense),
);
