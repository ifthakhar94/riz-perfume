import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes";
import { categoriesRouter } from "../modules/categories/categories.routes";
import { healthRouter } from "../modules/health/health.routes";
import { productsRouter } from "../modules/products/products.routes";
import { sizesRouter } from "../modules/sizes/sizes.routes";
import { typesRouter } from "../modules/types/types.routes";
import { usersRouter } from "../modules/users/users.routes";
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
