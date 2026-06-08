import type { DeliveryStatus, OrderStatus } from "@riz/shared";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Order lifecycle statuses, in workflow order, with display label + colour. */
export const ORDER_STATUSES: { value: OrderStatus; label: string; className: string }[] = [
  { value: "PENDING", label: "Pending", className: "bg-amber-100 text-amber-700" },
  { value: "CONFIRMED", label: "Confirmed", className: "bg-sky-100 text-sky-700" },
  { value: "PROCESSING", label: "Processing", className: "bg-indigo-100 text-indigo-700" },
  { value: "SHIPPED", label: "Shipped", className: "bg-violet-100 text-violet-700" },
  { value: "DELIVERED", label: "Delivered", className: "bg-emerald-100 text-emerald-700" },
  { value: "CANCELED", label: "Canceled", className: "bg-rose-100 text-rose-700" },
];

export const DELIVERY_STATUSES: { value: DeliveryStatus; label: string; className: string }[] = [
  { value: "PENDING", label: "Pending", className: "bg-amber-100 text-amber-700" },
  { value: "DISPATCHED", label: "Dispatched", className: "bg-sky-100 text-sky-700" },
  { value: "DELIVERED", label: "Delivered", className: "bg-emerald-100 text-emerald-700" },
  { value: "CANCELED", label: "Canceled", className: "bg-rose-100 text-rose-700" },
];

const orderStatusMap = Object.fromEntries(ORDER_STATUSES.map((status) => [status.value, status]));
const deliveryStatusMap = Object.fromEntries(
  DELIVERY_STATUSES.map((status) => [status.value, status]),
);

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = orderStatusMap[status];
  return (
    <Badge variant="muted" className={cn("border-transparent", meta?.className)}>
      {meta?.label ?? status}
    </Badge>
  );
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const meta = deliveryStatusMap[status];
  return (
    <Badge variant="muted" className={cn("border-transparent", meta?.className)}>
      {meta?.label ?? status}
    </Badge>
  );
}
