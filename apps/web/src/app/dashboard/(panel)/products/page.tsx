"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ProductListItemDto } from "@riz/shared";

import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useDeleteProductMutation, useGetProductsQuery } from "@/store/api/productsApi";

const PAGE_SIZE = 10;
const COL_COUNT = 5;

const formatPrice = (value: number | null) =>
  value === null ? "—" : `BDT ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export default function ProductsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ProductListItemDto | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError } = useGetProductsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    includeInactive: true,
  });
  const [deleteProduct, deleteState] = useDeleteProductMutation();

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id).unwrap();
      toast.success("Product deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete product"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your fragrance catalog."
        action={
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="h-4 w-4" />
              New Product
            </Link>
          </Button>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search products…"
          className="pl-9"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Status</TableHead>
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
                  Failed to load products.
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COL_COUNT}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, external Cloudinary URL
                          <img
                            src={product.imageUrl}
                            alt={product.imageAlt ?? product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{product.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          /{product.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.categories.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        product.categories.map((category) => (
                          <Badge key={category.id} variant="muted">
                            {category.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatPrice(product.fromPrice)}
                  </TableCell>
                  <TableCell>
                    {product.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="muted">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(product)}
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete product?"
        description={
          deleteTarget ? `"${deleteTarget.name}" will be removed from the catalog.` : undefined
        }
        loading={deleteState.isLoading}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
