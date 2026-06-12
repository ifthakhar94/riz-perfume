import { z } from "zod";

const nullableText = (max: number) => z.string().trim().max(max).nullable().optional();

// Fragrance notes / accords are lists of short strings.
const nullableStringArray = z
  .array(z.string().trim().min(1).max(100))
  .max(50)
  .nullable()
  .optional();

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(255),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "slug may contain only lowercase letters, numbers and hyphens")
    .optional(),
  imageUrl: nullableText(2048),
  imageAlt: nullableText(255),
  metaTitle: nullableText(255),
  metaDescription: nullableText(5000),
  ogTitle: nullableText(255),
  ogDescription: nullableText(5000),
  ogImageUrl: nullableText(2048),
  inspiredBy: nullableText(255),
  topNotes: nullableStringArray,
  middleNotes: nullableStringArray,
  baseNotes: nullableStringArray,
  mainAccords: nullableStringArray,
  description: nullableText(50000),
  isActive: z.boolean().optional(),
  categoryIds: z.array(z.coerce.number().int().positive()).max(50).optional(),
  relatedProductIds: z.array(z.coerce.number().int().positive()).max(50).optional(),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(255).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  /** Category slug filter (e.g. "wood") — preferred by the storefront. */
  category: z.string().trim().min(1).max(180).optional(),
  includeInactive: z.coerce.boolean().optional(),
});

export const slugParamSchema = z.object({
  slug: z.string().trim().min(1).max(255),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
