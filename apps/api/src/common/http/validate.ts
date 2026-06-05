import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Validate (and coerce) the request against zod schemas. Parsed values replace
 * the raw input so downstream handlers receive typed, normalized data. Any
 * ZodError is forwarded to the central error handler as a 400.
 */
export const validate =
  (schemas: ValidationSchemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query));
      next();
    } catch (err) {
      next(err);
    }
  };
