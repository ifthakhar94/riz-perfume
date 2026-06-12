import { beforeEach, describe, expect, it } from "vitest";

import { makeStore } from "@/store";

import { readCartFromStorage, setupCartPersistence, writeCartToStorage } from "./cart-storage";
import { itemAdded, selectCartItems, type CartItem } from "./cartSlice";

const ITEM: CartItem = {
  productId: 1,
  variantId: 12,
  variantLabel: "Spray · 5ml",
  name: "Noir Intense",
  slug: "noir-intense",
  imageUrl: null,
  unitPrice: 1250,
  quantity: 2,
};

const STORAGE_KEY = "riz-perfume:cart:v1";

describe("cart persistence", () => {
  beforeEach(() => window.localStorage.clear());

  it("round-trips items through localStorage", () => {
    writeCartToStorage([ITEM]);
    expect(readCartFromStorage()).toEqual([ITEM]);
  });

  it("returns an empty cart for corrupt or invalid storage", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(readCartFromStorage()).toEqual([]);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: "wrong shape" }));
    expect(readCartFromStorage()).toEqual([]);
  });

  it("filters out malformed entries", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([ITEM, { productId: "nope" }, { ...ITEM, quantity: 0 }]),
    );
    expect(readCartFromStorage()).toEqual([ITEM]);
  });

  it("persists store changes and hydrates a fresh store", () => {
    // Session 1: add an item — persisted automatically via subscription.
    const first = makeStore();
    const unsubscribe = setupCartPersistence(first);
    first.dispatch(itemAdded(ITEM));
    unsubscribe();
    expect(readCartFromStorage()).toEqual([ITEM]);

    // Session 2 ("reload"): a brand-new store hydrates from storage.
    const second = makeStore();
    setupCartPersistence(second);
    expect(selectCartItems(second.getState())).toEqual([ITEM]);
  });
});
