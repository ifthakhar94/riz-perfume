import { z } from "zod";

export const createExpenseCategorySchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateExpenseCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export const listExpenseCategoriesQuerySchema = z.object({
  includeInactive: z.coerce.boolean().optional(),
});
