import "reflect-metadata";
import path from "node:path";

import { DataSource } from "typeorm";

import { env, isDevelopment } from "./env";

/**
 * TypeORM data source for PostgreSQL.
 *
 * `synchronize` is intentionally OFF — schema changes go through migrations so
 * we never risk destructive auto-sync against a real database. Entities and
 * migrations are picked up by glob and will be populated in the next phase.
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  ...(env.DATABASE_URL
    ? { url: env.DATABASE_URL }
    : {
        host: env.DB_HOST,
        port: env.DB_PORT,
        username: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
      }),
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: isDevelopment ? ["error", "warn", "migration"] : ["error"],
  entities: [path.join(__dirname, "../entities/**/*.{ts,js}")],
  migrations: [path.join(__dirname, "../migrations/**/*.{ts,js}")],
  subscribers: [],
});
