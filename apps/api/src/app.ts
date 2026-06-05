import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { env } from "./config/env";
import { logger } from "./lib/logger";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { apiRouter } from "./routes";

/**
 * Builds the Express application. Kept free of side effects (no listening, no DB
 * connection) so it can be imported directly by integration tests.
 */
export const createApp = (): Express => {
  const app = express();

  // Behind a reverse proxy/load balancer in production.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // Security & performance middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
      credentials: true,
    }),
  );
  app.use(compression());

  // Body + cookie parsing with sane limits
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());

  // Structured request logging
  app.use(pinoHttp({ logger }));

  // Basic abuse protection
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    }),
  );

  // Routes
  app.use("/api", apiRouter);

  // 404 + centralized error handling (must be registered last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
