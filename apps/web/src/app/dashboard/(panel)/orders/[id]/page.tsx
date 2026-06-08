"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ArrowLeft, Loader2 } from "lucide-react";

import type { AppliedOfferDto } from "@riz/shared";

import { OrderDeliveryCard } from "@/components/dashboard/orders/order-delivery-card";
import { OrderStatusBadge } from "@/components/dashboard/orders/order-status";
import { OrderStatusCard } from "@/components/dashboard/orders/order-status-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBDT, formatDateTime } from "@/lib/format";
import { useGetOrderQuery } from "@/store/api/ordersApi";

const OFFER_LABELS: Record<AppliedOfferDto["offerType"], string> = {
  FREE_DELIVERY: "Free delivery",
  PRODUCT_PERCENT: "Product discount",
  ORDER_PERCENT: "Order discount",
  FLAT_DISCOUNT_TK: "Flat discount",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: order, isLoading, isError } = useGetOrderQuery(id, { skip: Number.isNaN(id) });

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        </Button>

        {order ? (
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl font-bold tracking-tight">Order #{order.id}</h1>
            <OrderStatusBadge status={order.status} />
            <span className="text-sm text-muted-foreground">
              Placed {formatDateTime(order.createdAt)}
            </span>
          </div>
        ) : (
          <h1 className="font-serif text-2xl font-bold tracking-tight">Order</h1>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : isError || !order ? (
        <p className="text-sm text-muted-foreground">Order not found.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Unit price</TableHead>
                      <TableHead className="text-right">Line total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">
                            {[item.sizeName, item.typeName].filter(Boolean).join(" · ") ||
                              `Variant #${item.productVariantId}`}
                          </div>
                          {item.sku ? (
                            <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatBDT(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatBDT(item.lineTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatBDT(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{formatBDT(order.deliveryTotal)}</span>
                </div>
                {order.discountTotal > 0 ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>− {formatBDT(order.discountTotal)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatBDT(order.total)}</span>
                </div>

                {order.appliedOffers.length > 0 ? (
                  <div className="space-y-1.5 border-t pt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Applied offers
                    </p>
                    {order.appliedOffers.map((offer, index) => (
                      <div
                        key={`${offer.offerId}-${offer.scope}-${offer.orderItemId ?? index}`}
                        className="flex justify-between text-xs"
                      >
                        <span className="text-muted-foreground">
                          {OFFER_LABELS[offer.offerType]}
                          {offer.scope === "item" ? " (item)" : ""}
                        </span>
                        <span className="text-emerald-700">
                          − {formatBDT(offer.discountAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {order.cost ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cost &amp; margin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Raw material</span>
                    <span>{formatBDT(order.cost.rawMaterialCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bottle</span>
                    <span>{formatBDT(order.cost.bottleCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Packaging</span>
                    <span>{formatBDT(order.cost.packagingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{formatBDT(order.cost.deliveryCost)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total cost</span>
                    <span>{formatBDT(order.cost.totalCost)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-semibold">
                    <span>Est. margin</span>
                    <span
                      className={
                        order.total - order.cost.totalCost >= 0
                          ? "text-emerald-700"
                          : "text-destructive"
                      }
                    >
                      {formatBDT(order.total - order.cost.totalCost)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Margin = order total − total cost. Internal; not shown to customers.
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{order.customer.username}</p>
                <p className="text-muted-foreground">{order.customer.email}</p>
                <p className="text-muted-foreground">{order.customer.phone}</p>
                <p className="pt-2">{order.customer.addressLine}</p>
                <p className="text-muted-foreground">{order.customer.district}</p>
                <p className="pt-2 text-xs text-muted-foreground">
                  {order.userId ? `Registered user #${order.userId}` : "Guest checkout"}
                </p>
              </CardContent>
            </Card>

            <OrderStatusCard orderId={order.id} status={order.status} />

            {order.delivery ? (
              <OrderDeliveryCard orderId={order.id} delivery={order.delivery} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
