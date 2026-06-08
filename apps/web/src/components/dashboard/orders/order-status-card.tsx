"use client";

import { useState } from "react";

import { toast } from "sonner";

import type { OrderStatus } from "@riz/shared";

import { ORDER_STATUSES } from "@/components/dashboard/orders/order-status";
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
import { getApiErrorMessage } from "@/lib/api-error";
import { useUpdateOrderStatusMutation } from "@/store/api/ordersApi";

export function OrderStatusCard({ orderId, status }: { orderId: number; status: OrderStatus }) {
  const [selected, setSelected] = useState<OrderStatus>(status);
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();

  const handleUpdate = async () => {
    try {
      await updateStatus({ id: orderId, status: selected }).unwrap();
      toast.success("Order status updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update status"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={selected} onValueChange={(value) => setSelected(value as OrderStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selected === "CANCELED" && status !== "CANCELED" ? (
          <p className="text-xs text-muted-foreground">
            Cancelling restores variant stock and cancels the delivery.
          </p>
        ) : null}
        <Button
          className="w-full"
          disabled={isLoading || selected === status}
          onClick={() => void handleUpdate()}
        >
          Update status
        </Button>
      </CardContent>
    </Card>
  );
}
