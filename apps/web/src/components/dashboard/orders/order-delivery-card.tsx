"use client";

import { useState } from "react";

import { toast } from "sonner";

import type { OrderDeliveryDto } from "@riz/shared";

import { DELIVERY_STATUSES } from "@/components/dashboard/orders/order-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatBDT, formatDateTime } from "@/lib/format";
import { useUpdateOrderDeliveryMutation } from "@/store/api/ordersApi";

export function OrderDeliveryCard({
  orderId,
  delivery,
}: {
  orderId: number;
  delivery: OrderDeliveryDto;
}) {
  const [selected, setSelected] = useState(delivery.status);
  const [reason, setReason] = useState(delivery.canceledReason ?? "");
  const [updateDelivery, { isLoading }] = useUpdateOrderDeliveryMutation();

  const unchanged =
    selected === delivery.status && reason.trim() === (delivery.canceledReason ?? "");

  const handleUpdate = async () => {
    try {
      await updateDelivery({
        id: orderId,
        body: {
          status: selected,
          canceledReason: selected === "CANCELED" ? reason.trim() || null : null,
        },
      }).unwrap();
      toast.success("Delivery updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update delivery"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Delivery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Courier charge</dt>
            <dd className="font-medium">{formatBDT(delivery.courierCharge)}</dd>
          </div>
          {delivery.deliveredAt ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivered</dt>
              <dd>{formatDateTime(delivery.deliveredAt)}</dd>
            </div>
          ) : null}
          {delivery.canceledAt ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Canceled</dt>
              <dd>{formatDateTime(delivery.canceledAt)}</dd>
            </div>
          ) : null}
        </dl>

        <div className="space-y-2">
          <Label>Delivery status</Label>
          <Select value={selected} onValueChange={(value) => setSelected(value as typeof selected)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_STATUSES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected === "CANCELED" ? (
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Cancellation reason</Label>
            <Textarea
              id="cancel-reason"
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Optional note"
            />
          </div>
        ) : null}

        <Button
          className="w-full"
          disabled={isLoading || unchanged}
          onClick={() => void handleUpdate()}
        >
          Update delivery
        </Button>
      </CardContent>
    </Card>
  );
}
