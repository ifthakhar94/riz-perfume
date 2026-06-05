import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes";
import { healthRouter } from "../modules/health/health.routes";
import { usersRouter } from "../modules/users/users.routes";

/**
 * Root API router. New feature modules (products, orders, ...) mount here.
 */
export const apiRouter: Router = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
