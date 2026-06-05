import "dotenv/config";
import { z } from "zod";

/**
 * Environment variable schema. The application refuses to boot with an invalid
 * environment — fail fast and loud rather than at some random point at runtime.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().min(1).default("0.0.0.0"),

  // CORS — comma-separated list of allowed origins
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // Logging
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  // Database (either DATABASE_URL or the discrete fields below)
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USERNAME: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  DB_NAME: z.string().default("riz_perfume"),
  DB_SSL: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),

  // Auth — JWT access token (stateless) + opaque refresh token (DB-backed)
  JWT_ACCESS_SECRET: z.string().min(16).default("dev-only-access-secret-change-me"),
  JWT_REFRESH_SECRET: z.string().min(16).default("dev-only-refresh-secret-change-me"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  REFRESH_COOKIE_NAME: z.string().default("riz_refresh_token"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  // Initial admin (used by the `seed:admin` script)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_FULLNAME: z.string().optional(),
  ADMIN_PHONE: z.string().optional(),
});

const parsed = envSchema
  .superRefine((value, ctx) => {
    // Never ship the development JWT secrets to production.
    if (value.NODE_ENV === "production") {
      if (value.JWT_ACCESS_SECRET.startsWith("dev-only")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["JWT_ACCESS_SECRET"],
          message: "must be set in production",
        });
      }
      if (value.JWT_REFRESH_SECRET.startsWith("dev-only")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["JWT_REFRESH_SECRET"],
          message: "must be set in production",
        });
      }
    }
  })
  .safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.flatten().fieldErrors;
  // Logged with console because env validation runs before the logger exists.
  console.error("❌ Invalid environment variables:\n", JSON.stringify(issues, null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
export const isDevelopment = env.NODE_ENV === "development";
