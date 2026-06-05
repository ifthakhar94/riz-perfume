import { Router } from "express";

import { asyncHandler } from "../../utils/async-handler";
import { getHealth } from "./health.controller";

export const healthRouter: Router = Router();

healthRouter.get("/", asyncHandler(getHealth));
