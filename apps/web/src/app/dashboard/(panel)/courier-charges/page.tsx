"use client";

import { useState, type FormEvent } from "react";

import type { ApexOptions } from "apexcharts";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { CourierChargeDto, CourierZone, DeliveryType } from "@riz/shared";

import { Chart } from "@/components/dashboard/chart";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useCreateCourierChargeMutation,
  useDeleteCourierChargeMutation,
  useGetCourierChargesQuery,
  useUpdateCourierChargeMutation,
} from "@/store/api/commerceApi";

const ZONE_LABELS: Record<CourierZone, string> = {
  inside_dhaka: "Inside Dhaka",
  outside_dhaka: "Outside Dhaka",
};
const DELIVERY_LABELS: Record<DeliveryType, string> = {
  home_delivery: "Home Delivery",
  courier_pickup: "Courier Pickup",
};

const formatBDT = (value: number) =>
  `BDT ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

interface FormState {
  courier: string;
  zone: string;
  deliveryType: string;
  charge: string;
  quantityToMultiplyCharge: string;
}

const EMPTY_FORM: FormState = {
  courier: "",
  zone: "",
  deliveryType: "",
  charge: "",
  quantityToMultiplyCharge: "1",
};

export default function CourierChargesPage() {
  const { data: charges, isLoading } = useGetCourierChargesQuery();
  const [createCharge, createState] = useCreateCourierChargeMutation();
  const [updateCharge, updateState] = useUpdateCourierChargeMutation();
  const [deleteCharge] = useDeleteCourierChargeMutation();
  const busy = createState.isLoading || updateState.isLoading;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CourierChargeDto | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<CourierChargeDto | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (charge: CourierChargeDto) => {
    setEditing(charge);
    setForm({
      courier: charge.courier,
      zone: charge.zone,
      deliveryType: charge.deliveryType,
      charge: String(charge.charge),
      quantityToMultiplyCharge: String(charge.quantityToMultiplyCharge),
    });
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.courier.trim() || !form.zone || !form.deliveryType || form.charge === "") {
      toast.error("Please complete all fields");
      return;
    }
    const body = {
      courier: form.courier.trim(),
      zone: form.zone as CourierZone,
      deliveryType: form.deliveryType as DeliveryType,
      charge: Number(form.charge),
      quantityToMultiplyCharge: Number(form.quantityToMultiplyCharge) || 1,
    };
    try {
      if (editing) {
        await updateCharge({ id: editing.id, body }).unwrap();
        toast.success("Courier charge updated");
      } else {
        await createCharge(body).unwrap();
        toast.success("Courier charge added");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save courier charge"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCharge(deleteTarget.id).unwrap();
      toast.success("Courier charge deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete courier charge"));
    } finally {
      setDeleteTarget(null);
    }
  };

  const rows = charges ?? [];
  const chartSeries = [{ name: "Charge", data: rows.map((row) => row.charge) }];
  const chartOptions: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#C41B35"],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "45%" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: rows.map(
        (row) => `${row.courier} · ${row.zone === "inside_dhaka" ? "In" : "Out"}`,
      ),
      labels: { rotate: -45, style: { fontSize: "11px" } },
    },
    yaxis: { labels: { formatter: (value) => `৳${Math.round(value)}` } },
    grid: { borderColor: "#eee", strokeDashArray: 4 },
    tooltip: { y: { formatter: (value) => formatBDT(value) } },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courier Charges"
        description="Delivery pricing by courier, zone and delivery type."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Charge
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery charges</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No courier charges yet — add one to see the chart.
            </p>
          ) : (
            <Chart type="bar" series={chartSeries} options={chartOptions} height={300} />
          )}
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Courier</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Charge</TableHead>
              <TableHead>×Qty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No courier charges yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((charge) => (
                <TableRow key={charge.id}>
                  <TableCell className="font-medium">{charge.courier}</TableCell>
                  <TableCell>{ZONE_LABELS[charge.zone]}</TableCell>
                  <TableCell>{DELIVERY_LABELS[charge.deliveryType]}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatBDT(charge.charge)}</TableCell>
                  <TableCell>{charge.quantityToMultiplyCharge}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(charge)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(charge)}
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit courier charge" : "New courier charge"}</DialogTitle>
            <DialogDescription>Pricing used at checkout for delivery.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courier">Courier</Label>
              <Input
                id="courier"
                value={form.courier}
                onChange={(event) =>
                  setForm((state) => ({ ...state, courier: event.target.value }))
                }
                placeholder="Pathao, Steadfast, …"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Zone</Label>
                <Select
                  value={form.zone}
                  onValueChange={(value) => setForm((state) => ({ ...state, zone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ZONE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Delivery type</Label>
                <Select
                  value={form.deliveryType}
                  onValueChange={(value) => setForm((state) => ({ ...state, deliveryType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DELIVERY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="charge">Charge (BDT)</Label>
                <Input
                  id="charge"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.charge}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, charge: event.target.value }))
                  }
                  placeholder="60.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qty">Qty multiplier</Label>
                <Input
                  id="qty"
                  type="number"
                  min="1"
                  value={form.quantityToMultiplyCharge}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, quantityToMultiplyCharge: event.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {editing ? "Save changes" : "Add charge"}
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
        title="Delete courier charge?"
        description={
          deleteTarget
            ? `${deleteTarget.courier} (${ZONE_LABELS[deleteTarget.zone]}) will be removed.`
            : undefined
        }
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
