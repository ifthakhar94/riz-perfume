import { Router } from "express";

import { validate } from "../../common/http/validate";
import { authenticate, optionalAuthenticate } from "../../middleware/authenticate";
import { asyncHandler } from "../../utils/async-handler";
import * as authController from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

export const authRouter: Router = Router();

authRouter.post(
  "/register",
  optionalAuthenticate,
  validate({ body: registerSchema }),
  asyncHandler(authController.register),
);
authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(authController.login));
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.get("/me", authenticate, asyncHandler(authController.me));
