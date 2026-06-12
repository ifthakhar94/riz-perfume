"use client";

import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { ProductListItemDto, ProductVariantDto } from "@riz/shared";

import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLazyGetProductBySlugQuery } from "@/store/api/productsApi";
import { itemAdded } from "@/store/cart/cartSlice";
import { useAppDispatch } from "@/store/hooks";

interface ProductCardProps {
  product: ProductListItemDto;
  /**
   * Pre-loaded variants (e.g. when the parent already fetched details).
   * When omitted, variants are lazily fetched on first hover/open via the
   * public `/products/[slug]` endpoint.
   */
  variants?: ProductVariantDto[];
  className?: string;
}

const chipClasses = (selected: boolean) =>
  cn(
    "h-7 min-w-7 px-2 text-xs uppercase tracking-[1px] transition-colors",
    selected
      ? "bg-primary text-primary-foreground"
      : "border border-border text-brand-grey hover:border-primary hover:text-primary",
  );

/**
 * Reusable storefront product card (home carousel, shop page later).
 * Hover (or the bag toggle on touch) expands a panel BELOW the card — per
 * the design — with type (Spray/Oil) and size chips side by side in one row
 * and an ADD TO CART button. Add-to-cart dispatches to the Redux cart with
 * the selected variant.
 */
export function ProductCard({ product, variants: variantsProp, className }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const [fetchDetail, { data: detail, isFetching }] = useLazyGetProductBySlugQuery();

  const variants = useMemo(() => {
    const source = variantsProp ?? detail?.variants ?? [];
    return source.filter((variant) => variant.isActive);
  }, [variantsProp, detail]);

  /** Unique types across variants, in first-seen order. */
  const types = useMemo(() => {
    const seen = new Map<number, ProductVariantDto["type"]>();
    for (const variant of variants) {
      if (!seen.has(variant.type.id)) seen.set(variant.type.id, variant.type);
    }
    return [...seen.values()];
  }, [variants]);

  const activeTypeId = selectedTypeId ?? types[0]?.id ?? null;
  const sizesForType = variants.filter((variant) => variant.type.id === activeTypeId);
  const selectedVariant =
    sizesForType.find((variant) => variant.id === selectedVariantId) ?? sizesForType[0] ?? null;

  const openPicker = () => {
    setOpen(true);
    // Lazy-load variants once; RTK Query caches by slug (`preferCacheValue`).
    if (!variantsProp && !detail) void fetchDetail(product.slug, true);
  };

  const selectType = (typeId: number) => {
    setSelectedTypeId(typeId);
    setSelectedVariantId(null); // fall back to the first size of the new type
  };

  const addToCart = () => {
    if (!selectedVariant) return;
    dispatch(
      itemAdded({
        productId: product.id,
        variantId: selectedVariant.id,
        variantLabel: `${selectedVariant.type.name} · ${selectedVariant.size.name}`,
        name: product.name,
        slug: product.slug,
        imageUrl: product.imageUrl,
        unitPrice: selectedVariant.price,
        quantity: 1,
      }),
    );
    toast.success(
      `${product.name} (${selectedVariant.type.name} · ${selectedVariant.size.name}) added to cart`,
    );
  };

  const outOfStock = selectedVariant !== null && selectedVariant.stockQuantity <= 0;

  /**
   * Price line (per the design): a "BDT min - BDT max" range once variants
   * are known, the from-price before that, and the exact variant price while
   * the picker is open with a selection.
   */
  const priceLine = (() => {
    if (open && selectedVariant) return formatBDT(selectedVariant.price);
    if (variants.length > 0) {
      const prices = variants.map((variant) => variant.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? formatBDT(min) : `${formatBDT(min)} - ${formatBDT(max)}`;
    }
    return product.fromPrice != null ? formatBDT(product.fromPrice) : "Price on request";
  })();

  return (
    <article
      data-testid="product-card"
      className={cn("group relative flex flex-col bg-background", open && "z-20", className)}
      onMouseEnter={openPicker}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`} aria-label={product.name}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-brand-grey flex h-full items-center justify-center text-xs uppercase tracking-[1px]">
              Riz Perfume
            </span>
          )}
        </Link>

        {/* Touch devices: explicit toggle since there is no hover */}
        <button
          type="button"
          aria-label={open ? "Hide options" : "Choose options"}
          aria-expanded={open}
          onClick={() => (open ? setOpen(false) : openPicker())}
          className="absolute top-2 right-2 flex size-8 items-center justify-center bg-white/80 text-brand-grey transition-colors hover:text-primary md:hidden"
        >
          <ShoppingCart aria-hidden="true" className="size-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Name + price (always visible) */}
      <div className="flex flex-col gap-1 pt-3 pb-1">
        <Link
          href={`/products/${product.slug}`}
          className="truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="text-brand-grey text-sm" data-testid="price-line">
          {priceLine}
        </p>
      </div>

      {/* Variant picker: expands below the card, overlaying content under it */}
      <div
        data-testid="variant-picker"
        className={cn(
          "absolute inset-x-0 top-full flex flex-col gap-2 border border-border bg-background p-3 shadow-md transition-all duration-200",
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        {isFetching && variants.length === 0 ? (
          <div className="flex gap-2">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-7 w-1/2" />
          </div>
        ) : variants.length === 0 ? (
          <p className="text-brand-grey text-xs">No options available right now.</p>
        ) : (
          <>
            {/* Types and sizes side by side in a single row (per design) */}
            <div className="flex flex-wrap items-center gap-1.5">
              {types.length > 1 ? (
                <>
                  <div role="group" aria-label="Product type" className="flex gap-1.5">
                    {types.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        aria-pressed={type.id === activeTypeId}
                        onClick={() => selectType(type.id)}
                        className={chipClasses(type.id === activeTypeId)}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                  <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-border" />
                </>
              ) : null}
              <div role="group" aria-label="Size" className="flex flex-wrap gap-1.5">
                {sizesForType.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    aria-pressed={variant.id === selectedVariant?.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={chipClasses(variant.id === selectedVariant?.id)}
                  >
                    {variant.size.name}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={!selectedVariant || outOfStock}
              onClick={addToCart}
              className="flex h-8 items-center justify-center bg-primary px-4 text-xs font-medium tracking-[1px] text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {outOfStock ? "Out of stock" : "Add to cart"}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
