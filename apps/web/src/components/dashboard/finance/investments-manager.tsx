"use client";

import { useState, type FormEvent } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { InvestmentDto } from "@riz/shared";

import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatBDT } from "@/lib/format";
import {
  useCreateInvestmentMutation,
  useDeleteInvestmentMutation,
  useGetInvestmentsQuery,
  useUpdateInvestmentMutation,
} from "@/store/api/financeApi";

const PAGE_SIZE = 10;

interface InvestmentFormState {
  investorName: string;
  amount: string;
  transactionMedium: string;
  transactionFromAccount: string;
  receivedAccount: string;
  proofDetails: string;
  updateReason: string;
}

const EMPTY_FORM: InvestmentFormState = {
  investorName: "",
  amount: "",
  transactionMedium: "",
  transactionFromAccount: "",
  receivedAccount: "",
  proofDetails: "",
  updateReason: "",
};

export function InvestmentsManager() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetInvestmentsQuery({ page, pageSize: PAGE_SIZE });
  const [createInvestment, createState] = useCreateInvestmentMutation();
  const [updateInvestment, updateState] = useUpdateInvestmentMutation();
  const [deleteInvestment] = useDeleteInvestmentMutation();
  const busy = createState.isLoading || updateState.isLoading;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InvestmentDto | null>(null);
  const [form, setForm] = useState<InvestmentFormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<InvestmentDto | null>(null);

  const set = (patch: Partial<InvestmentFormState>) => setForm((state) => ({ ...state, ...patch }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (investment: InvestmentDto) => {
    setEditing(investment);
    setForm({
      investorName: investment.investorName,
      amount: String(investment.amount),
      transactionMedium: investment.transactionMedium ?? "",
      transactionFromAccount: investment.transactionFromAccount ?? "",
      receivedAccount: investment.receivedAccount ?? "",
      proofDetails: investment.proofDetails ?? "",
      updateReason: "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.investorName.trim() || form.amount === "") {
      toast.error("Investor name and amount are required");
      return;
    }
    const body = {
      investorName: form.investorName.trim(),
      amount: Number(form.amount),
      transactionMedium: form.transactionMedium.trim() || null,
      transactionFromAccount: form.transactionFromAccount.trim() || null,
      receivedAccount: form.receivedAccount.trim() || null,
      proofDetails: form.proofDetails.trim() || null,
      updateReason: form.updateReason.trim() || null,
    };
    try {
      if (editing) {
        await updateInvestment({ id: editing.id, body }).unwrap();
        toast.success("Investment updated");
      } else {
        await createInvestment(body).unwrap();
        toast.success("Investment added");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save investment"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteInvestment(deleteTarget.id).unwrap();
      toast.success("Investment deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete investment"));
    } finally {
      setDeleteTarget(null);
    }
  };

  const rows = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Investment
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Investor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Medium</TableHead>
              <TableHead>Received account</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No investments yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell className="font-medium">{investment.investorName}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatBDT(investment.amount)}
                  </TableCell>
                  <TableCell>{investment.transactionMedium ?? "—"}</TableCell>
                  <TableCell>{investment.receivedAccount ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(investment)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(investment)}
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

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages || isFetching}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit investment" : "New investment"}</DialogTitle>
            <DialogDescription>Capital injected into the business.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inv-investor">Investor name</Label>
                <Input
                  id="inv-investor"
                  value={form.investorName}
                  onChange={(event) => set({ investorName: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-amount">Amount (BDT)</Label>
                <Input
                  id="inv-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(event) => set({ amount: event.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inv-medium">Transaction medium</Label>
                <Input
                  id="inv-medium"
                  value={form.transactionMedium}
                  onChange={(event) => set({ transactionMedium: event.target.value })}
                  placeholder="Bank, bKash…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-from">From account</Label>
                <Input
                  id="inv-from"
                  value={form.transactionFromAccount}
                  onChange={(event) => set({ transactionFromAccount: event.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-received">Received account</Label>
              <Input
                id="inv-received"
                value={form.receivedAccount}
                onChange={(event) => set({ receivedAccount: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-proof">Proof details</Label>
              <Textarea
                id="inv-proof"
                rows={2}
                value={form.proofDetails}
                onChange={(event) => set({ proofDetails: event.target.value })}
              />
            </div>
            {editing ? (
              <div className="space-y-2">
                <Label htmlFor="inv-reason">Update reason</Label>
                <Input
                  id="inv-reason"
                  value={form.updateReason}
                  onChange={(event) => set({ updateReason: event.target.value })}
                  placeholder="Why is this being changed?"
                />
              </div>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {editing ? "Save changes" : "Add investment"}
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
        title="Delete investment?"
        description={
          deleteTarget
            ? `${deleteTarget.investorName} · ${formatBDT(deleteTarget.amount)} will be removed.`
            : undefined
        }
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
