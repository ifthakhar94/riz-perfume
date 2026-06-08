import { z } from "zod";

import { CourierZone, DeliveryType } from "../../common/enums";

const money = z.coerce.number().nonnegative().max(99_999_999.99);

export const createCourierChargeSchema = z.object({
  courier: z.string().trim().min(1).max(120),
  zone: z.nativeEnum(CourierZone),
  deliveryType: z.nativeEnum(DeliveryType),
  charge: money,
  quantityToMultiplyCharge: z.coerce.number().int().positive().default(1),
});

export const updateCourierChargeSchema = z
  .object({
    courier: z.string().trim().min(1).max(120).optional(),
    zone: z.nativeEnum(CourierZone).optional(),
    deliveryType: z.nativeEnum(DeliveryType).optional(),
    charge: money.optional(),
    quantityToMultiplyCharge: z.coerce.number().int().positive().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export const listCourierChargesQuerySchema = z.object({
  zone: z.nativeEnum(CourierZone).optional(),
  deliveryType: z.nativeEnum(DeliveryType).optional(),
});
