"use client";

import { useEffect, useState, type FormEvent } from "react";

import { toast } from "sonner";

import type { OfferDto, OfferInput, OfferType } from "@riz/shared";

import { OFFER_TYPES, offerTypeMeta } from "@/components/dashboard/offers/offer-meta";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCreateOfferMutation, useUpdateOfferMutation } from "@/store/api/offersApi";

interface OfferFormState {
  name: string;
  type: OfferType;
  value: string;
  minOrderAmount: string;
  discountUpToAmount: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

/** ISO string → value for a `datetime-local` input (local wall-clock). */
const toLocalInput = (iso: string) => {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const defaultStart = () => toLocalInput(new Date().toISOString());
const defaultEnd = () => {
  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  return toLocalInput(end.toISOString());
};

const emptyForm = (): OfferFormState => ({
  name: "",
  type: "ORDER_PERCENT",
  value: "",
  minOrderAmount: "",
  discountUpToAmount: "",
  isActive: true,
  startDate: defaultStart(),
  endDate: defaultEnd(),
});

const fromOffer = (offer: OfferDto): OfferFormState => ({
  name: offer.name,
  type: offer.type,
  value: String(offer.value),
  minOrderAmount: offer.minOrderAmount === null ? "" : String(offer.minOrderAmount),
  discountUpToAmount: offer.discountUpToAmount === null ? "" : String(offer.discountUpToAmount),
  isActive: offer.isActive,
  startDate: toLocalInput(offer.startDate),
  endDate: toLocalInput(offer.endDate),
});

export function OfferFormDialog({
  open,
  onOpenChange,
  offer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: OfferDto | null;
}) {
  const [form, setForm] = useState<OfferFormState>(emptyForm());
  const [createOffer, createState] = useCreateOfferMutation();
  const [updateOffer, updateState] = useUpdateOfferMutation();
  const busy = createState.isLoading || updateState.isLoading;

  // Re-seed the form whenever the dialog opens (for create or a specific offer).
  useEffect(() => {
    if (open) setForm(offer ? fromOffer(offer) : emptyForm());
  }, [open, offer]);

  const set = (patch: Partial<OfferFormState>) => setForm((state) => ({ ...state, ...patch }));
  const meta = offerTypeMeta(form.type);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (meta.usesValue) {
      const num = Number(form.value);
      if (form.value === "" || Number.isNaN(num) || num <= 0) {
        toast.error(meta.isPercent ? "Enter a percentage greater than 0" : "Enter an amount");
        return;
      }
      if (meta.isPercent && num > 100) {
        toast.error("Percentage cannot exceed 100");
        return;
      }
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error("End date must be after the start date");
      return;
    }

    const body: OfferInput = {
      name: form.name.trim(),
      type: form.type,
      value: meta.usesValue ? Number(form.value) : 0,
      minOrderAmount: form.minOrderAmount === "" ? null : Number(form.minOrderAmount),
      discountUpToAmount:
        meta.usesCap && form.discountUpToAmount !== "" ? Number(form.discountUpToAmount) : null,
      isActive: form.isActive,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    try {
      if (offer) {
        await updateOffer({ id: offer.id, body }).unwrap();
        toast.success("Offer updated");
      } else {
        await createOffer(body).unwrap();
        toast.success("Offer created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save offer"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{offer ? "Edit offer" : "New offer"}</DialogTitle>
          <DialogDescription>{meta.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offer-name">Name</Label>
            <Input
              id="offer-name"
              value={form.name}
              onChange={(event) => set({ name: event.target.value })}
              placeholder="e.g. Eid Special"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) => set({ type: value as OfferType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OFFER_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {meta.usesValue ? (
              <div className="space-y-2">
                <Label htmlFor="offer-value">
                  {meta.isPercent ? "Discount (%)" : "Discount (BDT)"}
                </Label>
                <Input
                  id="offer-value"
                  type="number"
                  step={meta.isPercent ? "1" : "0.01"}
                  min="0"
                  max={meta.isPercent ? "100" : undefined}
                  value={form.value}
                  onChange={(event) => set({ value: event.target.value })}
                  placeholder={meta.isPercent ? "10" : "0.00"}
                />
              </div>
            ) : (
              <div className="flex items-end pb-2 text-sm text-muted-foreground">
                No amount needed.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offer-min">Min order (BDT)</Label>
              <Input
                id="offer-min"
                type="number"
                step="0.01"
                min="0"
                value={form.minOrderAmount}
                onChange={(event) => set({ minOrderAmount: event.target.value })}
                placeholder="Optional"
              />
            </div>
            {meta.usesCap ? (
              <div className="space-y-2">
                <Label htmlFor="offer-cap">Max discount (BDT)</Label>
                <Input
                  id="offer-cap"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.discountUpToAmount}
                  onChange={(event) => set({ discountUpToAmount: event.target.value })}
                  placeholder="Optional cap"
                />
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offer-start">Starts</Label>
              <Input
                id="offer-start"
                type="datetime-local"
                value={form.startDate}
                onChange={(event) => set({ startDate: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-end">Ends</Label>
              <Input
                id="offer-end"
                type="datetime-local"
                value={form.endDate}
                onChange={(event) => set({ endDate: event.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="offer-active">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive offers never apply, regardless of dates.
              </p>
            </div>
            <Switch
              id="offer-active"
              checked={form.isActive}
              onCheckedChange={(checked) => set({ isActive: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {offer ? "Save changes" : "Create offer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
