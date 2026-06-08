"use client";

import { useState, type FormEvent } from "react";

import { Coins, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ProductVariantDto } from "@riz/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-error";
import { useGetSizesQuery, useGetTypesQuery } from "@/store/api/catalogApi";
import {
  useCreateVariantMutation,
  useDeleteVariantMutation,
  useGetVariantsQuery,
  useUpdateVariantMutation,
} from "@/store/api/variantsApi";
import { ConfirmDialog } from "./confirm-dialog";
import { VariantCostDialog } from "./variant-cost-dialog";

interface VariantFormState {
  sizeId: string;
  typeId: string;
  price: string;
  sku: string;
  stockQuantity: string;
  isActive: boolean;
}

const EMPTY_FORM: VariantFormState = {
  sizeId: "",
  typeId: "",
  price: "",
  sku: "",
  stockQuantity: "0",
  isActive: true,
};

const formatPrice = (value: number) =>
  `BDT ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export function VariantsManager({ productId }: { productId: number }) {
  const { data: variants, isLoading } = useGetVariantsQuery(productId);
  const { data: sizes } = useGetSizesQuery();
  const { data: types } = useGetTypesQuery();
  const [createVariant, createState] = useCreateVariantMutation();
  const [updateVariant, updateState] = useUpdateVariantMutation();
  const [deleteVariant] = useDeleteVariantMutation();

  const busy = createState.isLoading || updateState.isLoading;
  const lookupsMissing = !sizes?.length || !types?.length;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductVariantDto | null>(null);
  const [formState, setFormState] = useState<VariantFormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<ProductVariantDto | null>(null);
  const [costTarget, setCostTarget] = useState<ProductVariantDto | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormState(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (variant: ProductVariantDto) => {
    setEditing(variant);
    setFormState({
      sizeId: String(variant.size.id),
      typeId: String(variant.type.id),
      price: String(variant.price),
      sku: variant.sku,
      stockQuantity: String(variant.stockQuantity),
      isActive: variant.isActive,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const sizeId = Number(formState.sizeId);
    const typeId = Number(formState.typeId);
    const price = Number(formState.price);
    const stockQuantity = Number(formState.stockQuantity);
    if (!sizeId || !typeId || !formState.sku.trim() || Number.isNaN(price)) {
      toast.error("Please complete all variant fields");
      return;
    }
    const body = {
      sizeId,
      typeId,
      price,
      sku: formState.sku.trim(),
      stockQuantity: Number.isNaN(stockQuantity) ? 0 : stockQuantity,
      isActive: formState.isActive,
    };
    try {
      if (editing) {
        await updateVariant({ id: editing.id, body }).unwrap();
        toast.success("Variant updated");
      } else {
        await createVariant({ productId, ...body }).unwrap();
        toast.success("Variant added");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save variant"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVariant(deleteTarget.id).unwrap();
      toast.success("Variant deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete variant"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Variants</CardTitle>
        <Button size="sm" onClick={openCreate} disabled={lookupsMissing}>
          <Plus className="h-4 w-4" />
          Add variant
        </Button>
      </CardHeader>
      <CardContent>
        {lookupsMissing ? (
          <p className="mb-3 text-sm text-muted-foreground">
            Add at least one Size and one Type before creating variants.
          </p>
        ) : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ) : !variants || variants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No variants yet.
                </TableCell>
              </TableRow>
            ) : (
              variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.sku}</TableCell>
                  <TableCell>{variant.size.name}</TableCell>
                  <TableCell>{variant.type.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatPrice(variant.price)}</TableCell>
                  <TableCell>{variant.stockQuantity}</TableCell>
                  <TableCell>
                    {variant.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="muted">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Set cost"
                        onClick={() => setCostTarget(variant)}
                      >
                        <Coins className="h-4 w-4" />
                        <span className="sr-only">Cost</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(variant)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(variant)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit variant" : "Add variant"}</DialogTitle>
            <DialogDescription>
              Size + type combination with price, SKU and stock.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Size</Label>
                <Select
                  value={formState.sizeId}
                  onValueChange={(value) => setFormState((state) => ({ ...state, sizeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes?.map((size) => (
                      <SelectItem key={size.id} value={String(size.id)}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formState.typeId}
                  onValueChange={(value) => setFormState((state) => ({ ...state, typeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types?.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variant-price">Price (BDT)</Label>
                <Input
                  id="variant-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formState.price}
                  onChange={(event) =>
                    setFormState((state) => ({ ...state, price: event.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant-stock">Stock</Label>
                <Input
                  id="variant-stock"
                  type="number"
                  min="0"
                  value={formState.stockQuantity}
                  onChange={(event) =>
                    setFormState((state) => ({ ...state, stockQuantity: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="variant-sku">SKU</Label>
              <Input
                id="variant-sku"
                value={formState.sku}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, sku: event.target.value }))
                }
                placeholder="OUD-50ML-EDP"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="variant-active">Active</Label>
              <Switch
                id="variant-active"
                checked={formState.isActive}
                onCheckedChange={(checked) =>
                  setFormState((state) => ({ ...state, isActive: checked }))
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {editing ? "Save changes" : "Add variant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete variant?"
        description={deleteTarget ? `"${deleteTarget.sku}" will be removed.` : undefined}
        onConfirm={() => void handleDelete()}
      />

      <VariantCostDialog variant={costTarget} onClose={() => setCostTarget(null)} />
    </Card>
  );
}
