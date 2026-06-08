import { z } from "zod";

import { DeliveryStatus, OrderStatus } from "../../common/enums";

export const createOrderSchema = z.object({
  username: z.string().trim().min(1).max(150),
  email: z.string().trim().toLowerCase().email().max(255),
  phone: z.string().trim().min(4).max(30),
  district: z.string().trim().min(1).max(120),
  addressLine: z.string().trim().min(1).max(1000),
  courierChargeId: z.coerce.number().int().positive(),
  items: z
    .array(
      z.object({
        productVariantId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive().max(1000),
      }),
    )
    .min(1)
    .max(100),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const updateDeliverySchema = z
  .object({
    status: z.nativeEnum(DeliveryStatus).optional(),
    canceledReason: z.string().trim().max(1000).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
