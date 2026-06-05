import "reflect-metadata";

import type { Server } from "node:http";

import { createApp } from "./app";
import { AppDataSource } from "./config/data-source";
import { env } from "./config/env";
import { logger } from "./lib/logger";

const startServer = async (): Promise<void> => {
  // Connect to the database, but don't crash if it's unavailable — the API
  // boots in a "degraded" mode and the health check reports the DB as down.
  try {
    await AppDataSource.initialize();
    logger.info("Database connection established");
  } catch (err) {
    logger.error({ err }, "Database connection failed — starting in degraded mode");
  }

  const app = createApp();
  const server: Server = app.listen(env.PORT, env.HOST, () => {
    logger.info(`🚀 API listening on http://${env.HOST}:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      void (async () => {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }
        logger.info("Shutdown complete");
        process.exit(0);
      })();
    });
    // Force-exit if graceful shutdown takes too long.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

void startServer();
