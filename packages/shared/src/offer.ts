export type OfferType = "FREE_DELIVERY" | "PRODUCT_PERCENT" | "ORDER_PERCENT" | "FLAT_DISCOUNT_TK";

export interface OfferDto {
  id: number;
  name: string;
  type: OfferType;
  value: number;
  minOrderAmount: number | null;
  discountUpToAmount: number | null;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

/** Request payload to create/update an offer. */
export interface OfferInput {
  name: string;
  type: OfferType;
  value: number;
  minOrderAmount?: number | null;
  discountUpToAmount?: number | null;
  isActive?: boolean;
  startDate: string;
  endDate: string;
}

/** An offer applied to an order (or an order item) at checkout. */
export interface AppliedOfferDto {
  offerId: number;
  offerType: OfferType;
  scope: "order" | "item";
  orderItemId?: number;
  discountAmount: number;
}
