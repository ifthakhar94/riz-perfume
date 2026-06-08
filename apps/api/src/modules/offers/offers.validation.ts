import { z } from "zod";

import { OfferType } from "../../common/enums";

const money = z.coerce.number().nonnegative().max(99_999_999.99);
const isPercentType = (type: OfferType) =>
  type === OfferType.ORDER_PERCENT || type === OfferType.PRODUCT_PERCENT;

export const createOfferSchema = z
  .object({
    name: z.string().trim().min(1).max(150),
    type: z.nativeEnum(OfferType),
    value: money,
    minOrderAmount: money.nullable().optional(),
    discountUpToAmount: money.nullable().optional(),
    isActive: z.boolean().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((value) => value.endDate > value.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  })
  .refine((value) => !isPercentType(value.type) || value.value <= 100, {
    message: "Percentage value must be ≤ 100",
    path: ["value"],
  });

export const updateOfferSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    type: z.nativeEnum(OfferType).optional(),
    value: money.optional(),
    minOrderAmount: money.nullable().optional(),
    discountUpToAmount: money.nullable().optional(),
    isActive: z.boolean().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });
