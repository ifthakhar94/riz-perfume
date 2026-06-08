"use client";

import Link from "next/link";

import {
  BadgePercent,
  Clock,
  FolderTree,
  Package,
  Ruler,
  ShoppingBag,
  SprayCan,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { offerState } from "@/components/dashboard/offers/offer-meta";
import { OrderStatusBadge } from "@/components/dashboard/orders/order-status";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { formatBDT, formatDateTime } from "@/lib/format";
import { useGetCategoriesQuery, useGetSizesQuery, useGetTypesQuery } from "@/store/api/catalogApi";
import { useGetOffersQuery } from "@/store/api/offersApi";
import { useGetOrdersQuery } from "@/store/api/ordersApi";
import { useGetProductsQuery } from "@/store/api/productsApi";

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  href,
}: {
  label: string;
  value?: number;
  icon: LucideIcon;
  loading: boolean;
  href?: string;
}) {
  const body = (
    <Card className={href ? "transition-colors hover:border-primary/40" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="font-serif text-3xl font-bold">{value ?? 0}</div>
        )}
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

export default function OverviewPage() {
  const { user } = useAuth();

  // pageSize:1 queries are just for the exact `pagination.total` counts.
  const recentOrders = useGetOrdersQuery({ page: 1, pageSize: 5 });
  const pendingOrders = useGetOrdersQuery({ pageSize: 1, status: "PENDING" });
  const offers = useGetOffersQuery();
  const products = useGetProductsQuery({ pageSize: 1, includeInactive: true });
  const categories = useGetCategoriesQuery({ includeInactive: true });
  const sizes = useGetSizesQuery();
  const types = useGetTypesQuery();

  const activeOffers = (offers.data ?? []).filter(
    (offer) => offerState(offer).label === "Live",
  ).length;
  const recent = recentOrders.data?.items ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome${user ? `, ${user.fullname.split(" ")[0]}` : ""}`}
        description="A snapshot of your store's activity."
      />

      {/* Commerce */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Orders"
          value={recentOrders.data?.pagination.total}
          icon={ShoppingBag}
          loading={recentOrders.isLoading}
          href="/dashboard/orders"
        />
        <StatCard
          label="Pending Orders"
          value={pendingOrders.data?.pagination.total}
          icon={Clock}
          loading={pendingOrders.isLoading}
          href="/dashboard/orders"
        />
        <StatCard
          label="Active Offers"
          value={activeOffers}
          icon={BadgePercent}
          loading={offers.isLoading}
          href="/dashboard/offers"
        />
      </div>

      {/* Recent orders */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold tracking-tight">Recent Orders</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/orders">View all</Link>
          </Button>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Placed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : recent.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        #{order.id}
                      </Link>
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {formatBDT(order.total)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Catalog */}
      <div>
        <h2 className="mb-3 font-serif text-lg font-bold tracking-tight">Catalog</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Products"
            value={products.data?.pagination.total}
            icon={Package}
            loading={products.isLoading}
            href="/dashboard/products"
          />
          <StatCard
            label="Categories"
            value={categories.data?.length}
            icon={FolderTree}
            loading={categories.isLoading}
            href="/dashboard/categories"
          />
          <StatCard
            label="Sizes"
            value={sizes.data?.length}
            icon={Ruler}
            loading={sizes.isLoading}
            href="/dashboard/sizes"
          />
          <StatCard
            label="Types"
            value={types.data?.length}
            icon={SprayCan}
            loading={types.isLoading}
            href="/dashboard/types"
          />
        </div>
      </div>
    </div>
  );
}
