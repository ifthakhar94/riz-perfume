import { describe, expect, it } from "vitest";

import {
  cartCleared,
  cartReducer,
  itemAdded,
  itemQuantitySet,
  itemRemoved,
  type CartItem,
  type CartState,
} from "./cartSlice";

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: 1,
  variantId: 10,
  variantLabel: "Spray · 5ml",
  name: "Noir Intense",
  slug: "noir-intense",
  imageUrl: null,
  unitPrice: 1250,
  quantity: 1,
  ...overrides,
});

describe("cartSlice", () => {
  it("adds a new line", () => {
    const state = cartReducer(undefined, itemAdded(item()));
    expect(state.items).toHaveLength(1);
  });

  it("merges quantity for the same product+variant", () => {
    let state = cartReducer(undefined, itemAdded(item()));
    state = cartReducer(state, itemAdded(item({ quantity: 2 })));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.quantity).toBe(3);
  });

  it("keeps separate lines per variant", () => {
    let state = cartReducer(undefined, itemAdded(item()));
    state = cartReducer(state, itemAdded(item({ variantId: 11 })));
    expect(state.items).toHaveLength(2);
  });

  it("removes a line", () => {
    let state = cartReducer(undefined, itemAdded(item()));
    state = cartReducer(state, itemRemoved({ productId: 1, variantId: 10 }));
    expect(state.items).toHaveLength(0);
  });

  it("sets quantity and drops the line at zero", () => {
    let state = cartReducer(undefined, itemAdded(item()));
    state = cartReducer(state, itemQuantitySet({ productId: 1, variantId: 10, quantity: 5 }));
    expect(state.items[0]?.quantity).toBe(5);
    state = cartReducer(state, itemQuantitySet({ productId: 1, variantId: 10, quantity: 0 }));
    expect(state.items).toHaveLength(0);
  });

  it("clears the cart", () => {
    let state: CartState = cartReducer(undefined, itemAdded(item()));
    state = cartReducer(state, cartCleared());
    expect(state.items).toHaveLength(0);
  });
});
