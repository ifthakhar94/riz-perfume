export type CourierZone = "inside_dhaka" | "outside_dhaka";
export type DeliveryType = "home_delivery" | "courier_pickup";

export interface CourierChargeDto {
  id: number;
  courier: string;
  zone: CourierZone;
  deliveryType: DeliveryType;
  charge: number;
  quantityToMultiplyCharge: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantCostDto {
  id: number;
  productVariantId: number;
  rawMaterialCost: number;
  bottleCost: number;
  createdAt: string;
  updatedAt: string;
}
