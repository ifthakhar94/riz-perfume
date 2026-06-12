"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/storefront/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetCategoriesQuery } from "@/store/api/catalogApi";
import { useGetProductsQuery } from "@/store/api/productsApi";

/** Products per carousel page (a 4-up row on desktop, 2×2 on mobile). */
const PAGE_SIZE = 4;

interface ProductSectionProps {
  className?: string;
}

/**
 * Home-page product carousel (Figma node 73:3061, tuned to the page
 * screenshot): category filter buttons top-LEFT (Featured / Top Sales / New
 * from the categories API), "1/7" pager with chevrons top-RIGHT, a paged
 * 4-up product grid, and a thin progress bar underneath reflecting the
 * current page. Cards are the reusable `ProductCard`.
 */
export function ProductSection({ className }: ProductSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);

  // The selected category lives in the URL as a human-readable slug
  // (`?category=wood`) so filters are shareable and survive back/forward
  // navigation; the API call derives from it.
  const categorySlug = searchParams.get("category") ?? undefined;

  // Reset the carousel page whenever the category changes (incl. back/forward).
  useEffect(() => setPage(1), [categorySlug]);

  const { data: categories } = useGetCategoriesQuery();
  const activeCategories = (categories ?? []).filter((category) => category.isActive);

  const { data, isFetching } = useGetProductsQuery({
    page,
    pageSize: PAGE_SIZE,
    category: categorySlug,
  });
  const products = data?.items ?? [];
  const totalPages = Math.max(data?.pagination.totalPages ?? 1, 1);

  const selectCategory = (next: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (next === undefined) {
      params.delete("category");
    } else {
      params.set("category", next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const goTo = (next: number) => setPage(((next - 1 + totalPages) % totalPages) + 1);

  return (
    <section aria-label="Products" className={cn("px-4 py-10 md:px-12", className)}>
      {/* Header row: filter buttons left · pager right */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          <FilterButton
            selected={categorySlug === undefined}
            onClick={() => selectCategory(undefined)}
          >
            All
          </FilterButton>
          {activeCategories.map((category) => (
            <FilterButton
              key={category.id}
              selected={categorySlug === category.slug}
              onClick={() => selectCategory(category.slug)}
            >
              {category.name}
            </FilterButton>
          ))}
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous products"
              onClick={() => goTo(page - 1)}
              className="text-brand-grey flex size-6 items-center justify-center transition-colors hover:text-primary"
            >
              <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
            </button>
            <p className="text-sm tracking-[1px] text-foreground" data-testid="carousel-pager">
              {page}/{totalPages}
            </p>
            <button
              type="button"
              aria-label="Next products"
              onClick={() => goTo(page + 1)}
              className="text-brand-grey flex size-6 items-center justify-center transition-colors hover:text-primary"
            >
              <ChevronRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        ) : null}
      </div>

      {/* Paged product grid */}
      <div aria-live="polite" className="mt-6">
        {isFetching && products.length === 0 ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-brand-grey py-12 text-center text-sm">
            No products in this category yet.
          </p>
        )}
      </div>

      {/* Progress bar: dark segment = current page position */}
      {totalPages > 1 ? (
        <div className="mt-8 h-px w-full bg-border" role="presentation">
          <div
            data-testid="carousel-progress"
            className="h-[2px] -translate-y-px bg-foreground/80 transition-all duration-300"
            style={{
              width: `${100 / totalPages}%`,
              marginLeft: `${((page - 1) * 100) / totalPages}%`,
            }}
          />
        </div>
      ) : null}
    </section>
  );
}

function FilterButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "h-8 px-4 text-xs uppercase tracking-[1px] transition-colors",
        selected
          ? "bg-primary text-primary-foreground"
          : "border border-border text-brand-grey hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
