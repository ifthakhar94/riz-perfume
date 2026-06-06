import type { ErrorRequestHandler } from "express";
import { QueryFailedError } from "typeorm";
import { ZodError } from "zod";

import type { ApiError } from "@riz/shared";

import { logger } from "../lib/logger";
import { AppError } from "../utils/app-error";

// Postgres SQLSTATE codes we translate into friendly client errors.
const PG_UNIQUE_VIOLATION = "23505";
const PG_FK_VIOLATION = "23503";

const pgErrorCode = (err: QueryFailedError): string | undefined =>
  (err.driverError as { code?: string } | undefined)?.code;

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

  // express.json() raises a SyntaxError (type "entity.parse.failed") on a body
  // that is not valid JSON.
  if (err instanceof SyntaxError && (err as { type?: string }).type === "entity.parse.failed") {
    res.status(400).json({
      success: false,
      error: { code: "INVALID_JSON", message: "Request body is not valid JSON" },
    } satisfies ApiError);
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

  if (err instanceof QueryFailedError) {
    const code = pgErrorCode(err);
    if (code === PG_UNIQUE_VIOLATION) {
      res.status(409).json({
        success: false,
        error: { code: "CONFLICT", message: "A record with these unique values already exists" },
      } satisfies ApiError);
      return;
    }
    if (code === PG_FK_VIOLATION) {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "This operation references a record that does not exist or is still in use",
        },
      } satisfies ApiError);
      return;
    }
  }

  logger.error({ err }, "Unhandled error");
  const body: ApiError = {
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" },
  };
  res.status(500).json(body);
};
