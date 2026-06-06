import { z } from "zod";

const price = z.coerce.number().nonnegative().max(99_999_999.99);

export const createVariantSchema = z.object({
  productId: z.coerce.number().int().positive(),
  sizeId: z.coerce.number().int().positive(),
  typeId: z.coerce.number().int().positive(),
  price,
  sku: z.string().trim().min(1).max(100),
  stockQuantity: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateVariantSchema = z
  .object({
    sizeId: z.coerce.number().int().positive().optional(),
    typeId: z.coerce.number().int().positive().optional(),
    price: price.optional(),
    sku: z.string().trim().min(1).max(100).optional(),
    stockQuantity: z.coerce.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export const listVariantsQuerySchema = z.object({
  productId: z.coerce.number().int().positive(),
});
