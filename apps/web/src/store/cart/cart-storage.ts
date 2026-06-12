import type { AppStore } from "@/store";

import { cartHydrated, type CartItem } from "./cartSlice";

/** Versioned key — bump if the CartItem shape changes incompatibly. */
const STORAGE_KEY = "riz-perfume:cart:v1";

/** Structural validation so corrupt/stale storage can never poison the store. */
const isCartItem = (value: unknown): value is CartItem => {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "number" &&
    (typeof item.variantId === "number" || item.variantId === null) &&
    (typeof item.variantLabel === "string" || item.variantLabel === null) &&
    typeof item.name === "string" &&
    typeof item.slug === "string" &&
    (typeof item.imageUrl === "string" || item.imageUrl === null) &&
    typeof item.unitPrice === "number" &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
};

export function readCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

export function writeCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private mode / quota) — cart stays in-memory only.
  }
}

/**
 * Hydrates the cart from localStorage and persists every subsequent change.
 * Called from `StoreProvider` AFTER mount so the first client render matches
 * the server HTML (no hydration mismatch). Returns an unsubscribe function.
 */
export function setupCartPersistence(store: AppStore): () => void {
  const stored = readCartFromStorage();
  if (stored.length > 0) {
    store.dispatch(cartHydrated(stored));
  }

  let previous = store.getState().cart.items;
  return store.subscribe(() => {
    const next = store.getState().cart.items;
    if (next !== previous) {
      previous = next;
      writeCartToStorage(next);
    }
  });
}
