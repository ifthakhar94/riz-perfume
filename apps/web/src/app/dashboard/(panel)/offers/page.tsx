"use client";

import { useState } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { OfferDto } from "@riz/shared";

import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { OfferFormDialog } from "@/components/dashboard/offers/offer-form-dialog";
import {
  OfferStateBadge,
  OfferTypeBadge,
  offerTypeMeta,
} from "@/components/dashboard/offers/offer-meta";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatBDT, formatDate } from "@/lib/format";
import { useDeleteOfferMutation, useGetOffersQuery } from "@/store/api/offersApi";

const COL_COUNT = 7;

/** Human-readable summary of an offer's value (depends on type). */
const offerValueLabel = (offer: OfferDto) => {
  const meta = offerTypeMeta(offer.type);
  if (!meta.usesValue) return "—";
  return meta.isPercent ? `${offer.value}%` : formatBDT(offer.value);
};

export default function OffersPage() {
  const { data: offers, isLoading, isError } = useGetOffersQuery();
  const [deleteOffer, deleteState] = useDeleteOfferMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OfferDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OfferDto | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (offer: OfferDto) => {
    setEditing(offer);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteOffer(deleteTarget.id).unwrap();
      toast.success("Offer deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete offer"));
    } finally {
      setDeleteTarget(null);
    }
  };

  const rows = offers ?? [];

  return (
    <div>
      <PageHeader
        title="Offers"
        description="Discounts applied automatically at checkout."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Offer
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min order</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={COL_COUNT}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={COL_COUNT}
                  className="py-10 text-center text-sm text-destructive"
                >
                  Failed to load offers.
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COL_COUNT}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No offers yet. Create one to start discounting checkouts.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.name}</TableCell>
                  <TableCell>
                    <OfferTypeBadge type={offer.type} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {offerValueLabel(offer)}
                    {offer.discountUpToAmount !== null ? (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        · max {formatBDT(offer.discountUpToAmount)}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {offer.minOrderAmount === null ? "—" : formatBDT(offer.minOrderAmount)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(offer.startDate)} – {formatDate(offer.endDate)}
                  </TableCell>
                  <TableCell>
                    <OfferStateBadge offer={offer} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(offer)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(offer)}
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
      </Card>

      <OfferFormDialog open={formOpen} onOpenChange={setFormOpen} offer={editing} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete offer?"
        description={
          deleteTarget ? `"${deleteTarget.name}" will no longer apply to new orders.` : undefined
        }
        loading={deleteState.isLoading}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
