"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ArrowLeft, Loader2 } from "lucide-react";

import { ProductForm } from "@/components/dashboard/product-form";
import { VariantsManager } from "@/components/dashboard/variants-manager";
import { Button } from "@/components/ui/button";
import { useGetProductByIdQuery } from "@/store/api/productsApi";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const {
    data: product,
    isLoading,
    isError,
  } = useGetProductByIdQuery(id, { skip: Number.isNaN(id) });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
        </Button>
        <h1 className="font-serif text-2xl font-bold tracking-tight">Edit Product</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : isError || !product ? (
        <p className="text-sm text-muted-foreground">Product not found.</p>
      ) : (
        <>
          <ProductForm product={product} />
          <VariantsManager productId={product.id} />
        </>
      )}
    </div>
  );
}
