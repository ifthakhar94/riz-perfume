/**
 * Interpret a query value as a boolean flag. Handles both raw query strings
 * ("true"/"1") and values already coerced to a boolean by zod validation.
 */
export const queryFlag = (value: unknown): boolean =>
  value === true || value === "true" || value === "1";
