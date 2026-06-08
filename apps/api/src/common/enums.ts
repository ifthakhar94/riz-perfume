/**
 * Runtime enums for fixed value sets. These emit JS (unlike the string-union
 * types in `@riz/shared`) because TypeORM and RBAC need them at runtime.
 */

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum CourierZone {
  INSIDE_DHAKA = "inside_dhaka",
  OUTSIDE_DHAKA = "outside_dhaka",
}

export enum DeliveryType {
  HOME_DELIVERY = "home_delivery",
  COURIER_PICKUP = "courier_pickup",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
}

export enum DeliveryStatus {
  PENDING = "PENDING",
  DISPATCHED = "DISPATCHED",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
}

export enum OfferType {
  FREE_DELIVERY = "FREE_DELIVERY",
  PRODUCT_PERCENT = "PRODUCT_PERCENT",
  ORDER_PERCENT = "ORDER_PERCENT",
  FLAT_DISCOUNT_TK = "FLAT_DISCOUNT_TK",
}
