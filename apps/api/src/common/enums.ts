/**
 * Runtime enums for fixed value sets. These emit JS (unlike the string-union
 * types in `@riz/shared`) because TypeORM and RBAC need them at runtime.
 */

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}
