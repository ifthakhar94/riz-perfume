"use client";

import Link from "next/link";
import { useState } from "react";

import { Eye } from "lucide-react";

import type { OrderStatus } from "@riz/shared";

import { ORDER_STATUSES, OrderStatusBadge } from "@/components/dashboard/orders/order-status";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { formatBDT, formatDateTime } from "@/lib/format";
import { useGetOrdersQuery } from "@/store/api/ordersApi";

const PAGE_SIZE = 10;
const COL_COUNT = 7;

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const { data, isLoading, isFetching, isError } = useGetOrdersQuery({
    page,
    pageSize: PAGE_SIZE,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const rows = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <PageHeader title="Orders" description="View and manage customer orders." />

      <div className="mb-4 w-52">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as "all" | OrderStatus);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
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
                  Failed to load orders.
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COL_COUNT}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.itemCount}</TableCell>
                  <TableCell className="whitespace-nowrap font-medium">
                    {formatBDT(order.total)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View order</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {pagination && pagination.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
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
    </div>
  );
}
