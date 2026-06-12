"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";

import { CartDrawer } from "@/components/storefront/cart-drawer";
import { formatTk } from "@/lib/format";
import { selectCartCount, selectCartSubtotal } from "@/store/cart/cartSlice";
import { useAppSelector } from "@/store/hooks";

/**
 * Cart icon with count badge + running subtotal (Figma 73:3037 / 73:3042 /
 * 73:3046). Opens the cart drawer; reads the client-side Redux cart.
 */
export function HeaderCart() {
  const [open, setOpen] = useState(false);
  const count = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);

  return (
    <CartDrawer
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          className="group flex items-center gap-4 outline-none"
          aria-label={`Open cart: ${count} ${count === 1 ? "item" : "items"}, ${formatTk(subtotal)}`}
        >
          <span className="relative inline-flex">
            <ShoppingCart
              aria-hidden="true"
              className="size-5 text-brand-grey transition-colors group-hover:text-primary"
              strokeWidth={1.5}
            />
            <span
              aria-hidden="true"
              data-testid="cart-count"
              className="absolute -top-2.5 -right-2 flex size-4 items-center justify-center rounded-full bg-brand-blush text-xs font-medium tracking-[1px] text-primary"
            >
              {count}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="hidden text-sm tracking-[1px] text-brand-grey uppercase transition-colors group-hover:text-primary sm:inline"
          >
            {formatTk(subtotal)}
          </span>
        </button>
      }
    />
  );
}
