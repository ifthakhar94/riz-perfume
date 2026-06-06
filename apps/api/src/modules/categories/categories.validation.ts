import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(150),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export const listCategoriesQuerySchema = z.object({
  includeInactive: z.coerce.boolean().optional(),
});
