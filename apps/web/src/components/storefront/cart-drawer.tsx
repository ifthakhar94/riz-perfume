"use client";

import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatTk } from "@/lib/format";
import {
  itemQuantitySet,
  itemRemoved,
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
  type CartItem,
} from "@/store/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface CartDrawerProps {
  /** The header cart control that opens the drawer. */
  trigger: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Slide-out cart (no Figma design — styled to match the storefront language:
 * Jost, brand grey, square corners, gradient CTA). Line items show the
 * selected type/size, quantity steppers, and a running subtotal.
 */
export function CartDrawer({ trigger, open, onOpenChange }: CartDrawerProps) {
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-left text-sm tracking-[1px] uppercase">
            Your cart ({count})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingCart
              aria-hidden="true"
              className="text-brand-grey size-8"
              strokeWidth={1.25}
            />
            <p className="text-brand-grey text-sm">Your cart is empty.</p>
            <Link
              href="/shop"
              onClick={() => onOpenChange(false)}
              className="text-xs tracking-[1px] text-primary uppercase underline-offset-4 hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-4">
              {items.map((item) => (
                <CartLine key={`${item.productId}:${item.variantId ?? "base"}`} item={item} />
              ))}
            </ul>

            <div className="border-t border-border px-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-grey tracking-[1px] uppercase">Subtotal</span>
                <span className="font-medium">{formatTk(subtotal)}</span>
              </div>
              <p className="text-brand-grey mt-1 text-xs">
                Delivery charges are calculated at checkout.
              </p>
              <Link
                href="/cart"
                onClick={() => onOpenChange(false)}
                className="mt-4 flex h-10 items-center justify-center bg-gradient-to-b from-[#EE3D4E] to-[#C51C36] text-xs font-medium tracking-[1px] text-white uppercase transition-opacity hover:opacity-90"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartLine({ item }: { item: CartItem }) {
  const dispatch = useAppDispatch();
  const key = { productId: item.productId, variantId: item.variantId };

  return (
    <li className="flex gap-3 py-4">
      <Link href={`/products/${item.slug}`} className="relative size-16 shrink-0 bg-muted">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.slug}`}
            className="truncate text-sm font-medium hover:text-primary"
          >
            {item.name}
          </Link>
          <button
            type="button"
            aria-label={`Remove ${item.name}`}
            onClick={() => dispatch(itemRemoved(key))}
            className="text-brand-grey transition-colors hover:text-primary"
          >
            <X aria-hidden="true" className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        {item.variantLabel ? <p className="text-brand-grey text-xs">{item.variantLabel}</p> : null}

        <div className="mt-1 flex items-center justify-between">
          <div
            className="flex items-center border border-border"
            role="group"
            aria-label={`Quantity for ${item.name}`}
          >
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => dispatch(itemQuantitySet({ ...key, quantity: item.quantity - 1 }))}
              className="text-brand-grey flex size-7 items-center justify-center transition-colors hover:text-primary"
            >
              <Minus aria-hidden="true" className="size-3" strokeWidth={1.5} />
            </button>
            <span className="w-7 text-center text-xs" data-testid="line-quantity">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => dispatch(itemQuantitySet({ ...key, quantity: item.quantity + 1 }))}
              className="text-brand-grey flex size-7 items-center justify-center transition-colors hover:text-primary"
            >
              <Plus aria-hidden="true" className="size-3" strokeWidth={1.5} />
            </button>
          </div>
          <p className="text-sm">{formatTk(item.unitPrice * item.quantity)}</p>
        </div>
      </div>
    </li>
  );
}
