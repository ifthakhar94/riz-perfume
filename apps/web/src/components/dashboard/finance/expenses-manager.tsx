"use client";

import { useState, type FormEvent } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ExpenseDto } from "@riz/shared";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseCategoriesQuery,
  useGetExpensesQuery,
  useUpdateExpenseMutation,
} from "@/store/api/financeApi";

const PAGE_SIZE = 10;
const today = () => new Date().toISOString().slice(0, 10);

interface ExpenseFormState {
  expenseCategoryId: string;
  expenseDate: string;
  amount: string;
  vendorName: string;
  paymentMethod: string;
  transactionReference: string;
  invoiceNumber: string;
  description: string;
}

const emptyForm = (): ExpenseFormState => ({
  expenseCategoryId: "",
  expenseDate: today(),
  amount: "",
  vendorName: "",
  paymentMethod: "",
  transactionReference: "",
  invoiceNumber: "",
  description: "",
});

export function ExpensesManager() {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: categories } = useGetExpenseCategoriesQuery({ includeInactive: true });
  const { data, isLoading, isFetching } = useGetExpensesQuery({
    page,
    pageSize: PAGE_SIZE,
    categoryId: categoryFilter === "all" ? undefined : Number(categoryFilter),
  });
  const [createExpense, createState] = useCreateExpenseMutation();
  const [updateExpense, updateState] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();
  const busy = createState.isLoading || updateState.isLoading;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseDto | null>(null);
  const [form, setForm] = useState<ExpenseFormState>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<ExpenseDto | null>(null);

  const set = (patch: Partial<ExpenseFormState>) => setForm((state) => ({ ...state, ...patch }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (expense: ExpenseDto) => {
    setEditing(expense);
    setForm({
      expenseCategoryId: String(expense.expenseCategoryId),
      expenseDate: expense.expenseDate,
      amount: String(expense.amount),
      vendorName: expense.vendorName ?? "",
      paymentMethod: expense.paymentMethod ?? "",
      transactionReference: expense.transactionReference ?? "",
      invoiceNumber: expense.invoiceNumber ?? "",
      description: expense.description ?? "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.expenseCategoryId || !form.expenseDate || form.amount === "") {
      toast.error("Category, date and amount are required");
      return;
    }
    const body = {
      expenseCategoryId: Number(form.expenseCategoryId),
      expenseDate: form.expenseDate,
      amount: Number(form.amount),
      vendorName: form.vendorName.trim() || null,
      paymentMethod: form.paymentMethod.trim() || null,
      transactionReference: form.transactionReference.trim() || null,
      invoiceNumber: form.invoiceNumber.trim() || null,
      description: form.description.trim() || null,
    };
    try {
      if (editing) {
        await updateExpense({ id: editing.id, body }).unwrap();
        toast.success("Expense updated");
      } else {
        await createExpense(body).unwrap();
        toast.success("Expense added");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save expense"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExpense(deleteTarget.id).unwrap();
      toast.success("Expense deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete expense"));
    } finally {
      setDeleteTarget(null);
    }
  };

  const rows = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-48">
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories ?? []).map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} disabled={!categories || categories.length === 0}>
          <Plus className="h-4 w-4" />
          New Expense
        </Button>
      </div>

      {categories && categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Create an expense category first (Categories tab).
        </p>
      ) : null}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No expenses yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="whitespace-nowrap">{expense.expenseDate}</TableCell>
                  <TableCell>{expense.category?.name ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap font-medium">
                    {formatBDT(expense.amount)}
                  </TableCell>
                  <TableCell>{expense.vendorName ?? "—"}</TableCell>
                  <TableCell>{expense.paymentMethod ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(expense)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(expense)}
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
            <DialogTitle>{editing ? "Edit expense" : "New expense"}</DialogTitle>
            <DialogDescription>Record a business expense.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.expenseCategoryId}
                  onValueChange={(value) => set({ expenseCategoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories ?? []).map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-date">Date</Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={form.expenseDate}
                  onChange={(event) => set({ expenseDate: event.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount (BDT)</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(event) => set({ amount: event.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-payment">Payment method</Label>
                <Input
                  id="expense-payment"
                  value={form.paymentMethod}
                  onChange={(event) => set({ paymentMethod: event.target.value })}
                  placeholder="Cash, bKash, Bank…"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-vendor">Vendor</Label>
                <Input
                  id="expense-vendor"
                  value={form.vendorName}
                  onChange={(event) => set({ vendorName: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-invoice">Invoice #</Label>
                <Input
                  id="expense-invoice"
                  value={form.invoiceNumber}
                  onChange={(event) => set({ invoiceNumber: event.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-ref">Transaction reference</Label>
              <Input
                id="expense-ref"
                value={form.transactionReference}
                onChange={(event) => set({ transactionReference: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-desc">Description</Label>
              <Textarea
                id="expense-desc"
                rows={2}
                value={form.description}
                onChange={(event) => set({ description: event.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {editing ? "Save changes" : "Add expense"}
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
        title="Delete expense?"
        description={
          deleteTarget
            ? `${formatBDT(deleteTarget.amount)} on ${deleteTarget.expenseDate} will be removed.`
            : undefined
        }
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
