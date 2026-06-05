import type { Request, Response } from "express";

import type { ApiError } from "@riz/shared";

export const notFoundHandler = (req: Request, res: Response): void => {
  const body: ApiError = {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  };
  res.status(404).json(body);
};
