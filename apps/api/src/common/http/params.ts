import { z } from "zod";

/** Reusable `:id` route param schema (coerced positive integer). */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
