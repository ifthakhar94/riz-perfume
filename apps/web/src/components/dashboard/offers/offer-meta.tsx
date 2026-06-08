import type { OfferDto, OfferType } from "@riz/shared";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface OfferTypeMeta {
  value: OfferType;
  label: string;
  description: string;
  /** Does `value` represent a percentage (vs a flat amount / unused)? */
  isPercent: boolean;
  /** Whether this type uses the `value` field at all. */
  usesValue: boolean;
  /** Whether a "max discount" cap (discountUpToAmount) is meaningful. */
  usesCap: boolean;
  className: string;
}

const OFFER_TYPE_MAP: Record<OfferType, OfferTypeMeta> = {
  FREE_DELIVERY: {
    value: "FREE_DELIVERY",
    label: "Free delivery",
    description: "Waives the courier charge.",
    isPercent: false,
    usesValue: false,
    usesCap: false,
    className: "bg-sky-100 text-sky-700",
  },
  PRODUCT_PERCENT: {
    value: "PRODUCT_PERCENT",
    label: "Product %",
    description: "Percent off each line item.",
    isPercent: true,
    usesValue: true,
    usesCap: true,
    className: "bg-indigo-100 text-indigo-700",
  },
  ORDER_PERCENT: {
    value: "ORDER_PERCENT",
    label: "Order %",
    description: "Percent off the order subtotal.",
    isPercent: true,
    usesValue: true,
    usesCap: true,
    className: "bg-violet-100 text-violet-700",
  },
  FLAT_DISCOUNT_TK: {
    value: "FLAT_DISCOUNT_TK",
    label: "Flat ৳",
    description: "Fixed taka amount off the order.",
    isPercent: false,
    usesValue: true,
    usesCap: false,
    className: "bg-amber-100 text-amber-700",
  },
};

export const OFFER_TYPES: OfferTypeMeta[] = Object.values(OFFER_TYPE_MAP);

export const offerTypeMeta = (type: OfferType): OfferTypeMeta => OFFER_TYPE_MAP[type];

export function OfferTypeBadge({ type }: { type: OfferType }) {
  const meta = offerTypeMeta(type);
  return (
    <Badge variant="muted" className={cn("border-transparent", meta.className)}>
      {meta.label}
    </Badge>
  );
}

type OfferState = { label: string; className: string };

/** Derive an offer's live state from its active flag + date window. */
export const offerState = (offer: OfferDto, now: number = Date.now()): OfferState => {
  if (!offer.isActive) return { label: "Inactive", className: "bg-muted text-muted-foreground" };
  const start = new Date(offer.startDate).getTime();
  const end = new Date(offer.endDate).getTime();
  if (now < start) return { label: "Scheduled", className: "bg-sky-100 text-sky-700" };
  if (now > end) return { label: "Expired", className: "bg-rose-100 text-rose-700" };
  return { label: "Live", className: "bg-emerald-100 text-emerald-700" };
};

export function OfferStateBadge({ offer }: { offer: OfferDto }) {
  const state = offerState(offer);
  return (
    <Badge variant="muted" className={cn("border-transparent", state.className)}>
      {state.label}
    </Badge>
  );
}
