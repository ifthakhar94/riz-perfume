import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import type { ApiError } from "@riz/shared";

import { logger } from "../lib/logger";
import { AppError } from "../utils/app-error";

/**
 * Central error handler. Translates known error types into the standard API
 * error envelope and never leaks internal details for unexpected errors.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    const body: ApiError = {
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const body: ApiError = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.flatten(),
      },
    };
    res.status(400).json(body);
    return;
  }

  logger.error({ err }, "Unhandled error");
  const body: ApiError = {
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" },
  };
  res.status(500).json(body);
};
