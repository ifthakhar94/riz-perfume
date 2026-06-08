"use client";

import { useEffect, useState, type FormEvent } from "react";

import { toast } from "sonner";

import type { ProductVariantDto } from "@riz/shared";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useCreateVariantCostMutation,
  useGetVariantCostsQuery,
  useUpdateVariantCostMutation,
} from "@/store/api/commerceApi";

const formatBDT = (value: number) =>
  `BDT ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export function VariantCostDialog({
  variant,
  onClose,
}: {
  variant: ProductVariantDto | null;
  onClose: () => void;
}) {
  const open = variant !== null;
  const { data: costs, isFetching } = useGetVariantCostsQuery(variant?.id ?? 0, {
    skip: !variant,
  });
  const currentCost = costs?.[0];

  const [rawMaterialCost, setRawMaterialCost] = useState("");
  const [bottleCost, setBottleCost] = useState("");
  const [createCost, createState] = useCreateVariantCostMutation();
  const [updateCost, updateState] = useUpdateVariantCostMutation();
  const busy = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (currentCost) {
      setRawMaterialCost(String(currentCost.rawMaterialCost));
      setBottleCost(String(currentCost.bottleCost));
    } else {
      setRawMaterialCost("");
      setBottleCost("");
    }
  }, [currentCost, variant?.id]);

  const totalCost = (Number(rawMaterialCost) || 0) + (Number(bottleCost) || 0);
  const margin = variant ? variant.price - totalCost : 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!variant) return;
    if (rawMaterialCost === "" || bottleCost === "") {
      toast.error("Enter both cost values");
      return;
    }
    const raw = Number(rawMaterialCost);
    const bottle = Number(bottleCost);
    try {
      if (currentCost) {
        await updateCost({
          id: currentCost.id,
          body: { rawMaterialCost: raw, bottleCost: bottle },
        }).unwrap();
      } else {
        await createCost({
          productVariantId: variant.id,
          rawMaterialCost: raw,
          bottleCost: bottle,
        }).unwrap();
      }
      toast.success("Cost saved");
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save cost"));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Variant cost</DialogTitle>
          <DialogDescription>
            {variant ? `${variant.sku} · ${variant.size.name} / ${variant.type.name}` : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isFetching ? (
            <p className="text-sm text-muted-foreground">Loading current cost…</p>
          ) : null}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="raw-cost">Raw material cost</Label>
              <Input
                id="raw-cost"
                type="number"
                step="0.01"
                min="0"
                value={rawMaterialCost}
                onChange={(event) => setRawMaterialCost(event.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bottle-cost">Bottle cost</Label>
              <Input
                id="bottle-cost"
                type="number"
                step="0.01"
                min="0"
                value={bottleCost}
                onChange={(event) => setBottleCost(event.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-1 rounded-md border bg-muted/30 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selling price</span>
              <span>{variant ? formatBDT(variant.price) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total cost</span>
              <span>{formatBDT(totalCost)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Margin</span>
              <span className={margin >= 0 ? "text-emerald-600" : "text-destructive"}>
                {formatBDT(margin)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              Save cost
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
