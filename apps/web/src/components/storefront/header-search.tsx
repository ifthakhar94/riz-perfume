"use client";

import { Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { formatTk } from "@/lib/format";
import { useGetProductsQuery } from "@/store/api/productsApi";

/** Minimum characters before we hit the API. */
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const MAX_RESULTS = 6;

interface HeaderSearchProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Expanding search panel under the header. Debounced product lookup via the
 * public products endpoint; results link to `/products/[slug]`.
 */
export function HeaderSearch({ open, onClose }: HeaderSearchProps) {
  const [term, setTerm] = useState("");
  const debouncedTerm = useDebounce(term.trim(), DEBOUNCE_MS);
  const inputRef = useRef<HTMLInputElement>(null);

  const skip = debouncedTerm.length < MIN_QUERY_LENGTH;
  const { data, isFetching } = useGetProductsQuery(
    { search: debouncedTerm, page: 1, pageSize: MAX_RESULTS },
    { skip },
  );

  // Focus the input when the panel opens; reset when it closes.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setTerm("");
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const products = data?.items ?? [];
  const showResults = !skip;

  return (
    <div className="absolute inset-x-0 top-full z-50 border-b border-border bg-background shadow-sm">
      <div className="mx-auto w-full max-w-2xl px-4 py-4 md:px-0">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="text-brand-grey absolute top-1/2 left-3 size-4 -translate-y-1/2"
            strokeWidth={1.5}
          />
          <Input
            ref={inputRef}
            type="search"
            role="searchbox"
            aria-label="Search products"
            placeholder="Search perfumes…"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            className="pr-10 pl-9"
          />
          {isFetching ? (
            <Loader2
              aria-hidden="true"
              className="text-brand-grey absolute top-1/2 right-10 size-4 -translate-y-1/2 animate-spin"
            />
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close search"
            onClick={onClose}
            className="text-brand-grey absolute top-1/2 right-1 size-7 -translate-y-1/2 hover:text-primary"
          >
            <X aria-hidden="true" className="size-4" strokeWidth={1.5} />
          </Button>
        </div>

        {showResults ? (
          <div className="mt-3" aria-live="polite">
            {isFetching && products.length === 0 ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="size-10 rounded-md" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <ul className="divide-y divide-border">
                {products.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent"
                    >
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.imageAlt ?? product.name}
                          width={40}
                          height={40}
                          className="size-10 rounded-md object-cover"
                        />
                      ) : (
                        <span className="bg-muted text-brand-grey flex size-10 items-center justify-center rounded-md text-xs">
                          —
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{product.name}</span>
                        <span className="text-brand-grey block text-xs">
                          {product.fromPrice != null
                            ? `From ${formatTk(product.fromPrice)}`
                            : "Price on request"}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-brand-grey p-2 text-sm">
                No products found for “{debouncedTerm}”.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
