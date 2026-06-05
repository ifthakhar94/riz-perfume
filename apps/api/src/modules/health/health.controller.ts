import type { Request, Response } from "express";

import type { ApiSuccess, HealthStatus } from "@riz/shared";

import { AppDataSource } from "../../config/data-source";

const SERVICE_NAME = "riz-perfume-api";
const SERVICE_VERSION = process.env.npm_package_version ?? "0.1.0";

/**
 * Liveness/readiness probe. Reports `ok` when the database is reachable and
 * `degraded` (HTTP 503) when it is not, so orchestrators can route traffic
 * accordingly.
 */
export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  let database: HealthStatus["checks"]["database"] = "down";

  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.query("SELECT 1");
      database = "up";
    }
  } catch {
    database = "down";
  }

  const payload: HealthStatus = {
    status: database === "up" ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    checks: { database },
  };

  const body: ApiSuccess<HealthStatus> = { success: true, data: payload };
  res.status(database === "up" ? 200 : 503).json(body);
};
