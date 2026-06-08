import type { AppliedOfferDto } from "./offer";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED";

export type DeliveryStatus = "PENDING" | "DISPATCHED" | "DELIVERED" | "CANCELED";

/** Request payload for `POST /api/orders` (guest-capable checkout). */
export interface CreateOrderInput {
  username: string;
  email: string;
  phone: string;
  district: string;
  addressLine: string;
  courierChargeId: number;
  items: { productVariantId: number; quantity: number }[];
}

export interface OrderCustomer {
  username: string;
  email: string;
  phone: string;
  district: string;
  addressLine: string;
}

export interface OrderItemDto {
  id: number;
  productVariantId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sku?: string;
  sizeName?: string;
  typeName?: string;
}

export interface OrderDeliveryDto {
  courierChargeId: number | null;
  courierCharge: number;
  status: DeliveryStatus;
  deliveredAt: string | null;
  canceledAt: string | null;
  canceledReason: string | null;
}

/** Internal cost breakdown — only exposed to admins. */
export interface OrderCostDto {
  rawMaterialCost: number;
  bottleCost: number;
  packagingCost: number;
  deliveryCost: number;
  totalCost: number;
}

export interface OrderDto {
  id: number;
  userId: number | null;
  status: OrderStatus;
  customer: OrderCustomer;
  items: OrderItemDto[];
  delivery: OrderDeliveryDto | null;
  cost?: OrderCostDto;
  subtotal: number;
  deliveryTotal: number;
  discountTotal: number;
  appliedOffers: AppliedOfferDto[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListItemDto {
  id: number;
  customerName: string;
  status: OrderStatus;
  itemCount: number;
  total: number;
  createdAt: string;
}
