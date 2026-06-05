import { Router } from "express";

import { healthRouter } from "../modules/health/health.routes";

/**
 * Root API router. New feature modules (auth, products, orders, ...) mount here.
 */
export const apiRouter: Router = Router();

apiRouter.use("/health", healthRouter);
