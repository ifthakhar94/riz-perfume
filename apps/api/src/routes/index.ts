import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes";
import { categoriesRouter } from "../modules/categories/categories.routes";
import { courierChargesRouter } from "../modules/courier-charges/courier-charges.routes";
import { expenseCategoriesRouter } from "../modules/expense-categories/expense-categories.routes";
import { expensesRouter } from "../modules/expenses/expenses.routes";
import { healthRouter } from "../modules/health/health.routes";
import { investmentsRouter } from "../modules/investments/investments.routes";
import { offersRouter } from "../modules/offers/offers.routes";
import { ordersRouter } from "../modules/orders/orders.routes";
import { productsRouter } from "../modules/products/products.routes";
import { sizesRouter } from "../modules/sizes/sizes.routes";
import { typesRouter } from "../modules/types/types.routes";
import { usersRouter } from "../modules/users/users.routes";
import { variantCostsRouter } from "../modules/variant-costs/variant-costs.routes";
import { variantsRouter } from "../modules/variants/variants.routes";

/**
 * Root API router. New feature modules (orders, offers, ...) mount here.
 */
export const apiRouter: Router = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);

// Catalog
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/sizes", sizesRouter);
apiRouter.use("/types", typesRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/variants", variantsRouter);
apiRouter.use("/variant-costs", variantCostsRouter);

// Commerce config
apiRouter.use("/courier-charges", courierChargesRouter);

// Orders
apiRouter.use("/orders", ordersRouter);

// Offers
apiRouter.use("/offers", offersRouter);

// Finance
apiRouter.use("/expense-categories", expenseCategoriesRouter);
apiRouter.use("/expenses", expensesRouter);
apiRouter.use("/investments", investmentsRouter);
