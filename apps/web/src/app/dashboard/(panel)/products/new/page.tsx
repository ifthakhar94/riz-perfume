"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { ProductForm } from "@/components/dashboard/product-form";
import { Button } from "@/components/ui/button";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/dashboard/products">
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      </Button>
      <h1 className="mb-6 font-serif text-2xl font-bold tracking-tight">New Product</h1>
      <ProductForm />
    </div>
  );
}
