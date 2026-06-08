import { z } from "zod";

const money = z.coerce.number().nonnegative().max(99_999_999.99);

export const createVariantCostSchema = z.object({
  productVariantId: z.coerce.number().int().positive(),
  rawMaterialCost: money,
  bottleCost: money,
});

export const updateVariantCostSchema = z
  .object({
    rawMaterialCost: money.optional(),
    bottleCost: money.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export const listVariantCostsQuerySchema = z.object({
  productVariantId: z.coerce.number().int().positive(),
});
