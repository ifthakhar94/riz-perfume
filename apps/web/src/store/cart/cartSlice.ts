import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "@/store";

/** A line in the client-side cart (cart is Redux-only — no cart API). */
export interface CartItem {
  productId: number;
  /** Selected variant, when the product was added from a variant picker. */
  variantId: number | null;
  /** Human label for the variant, e.g. "Spray · 5ml". */
  variantLabel: string | null;
  name: string;
  slug: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

const lineKey = (item: Pick<CartItem, "productId" | "variantId">) =>
  `${item.productId}:${item.variantId ?? "base"}`;

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Add a product (or bump quantity if the same product+variant exists). */
    itemAdded: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((i) => lineKey(i) === lineKey(action.payload));
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    itemRemoved: (state, action: PayloadAction<Pick<CartItem, "productId" | "variantId">>) => {
      state.items = state.items.filter((i) => lineKey(i) !== lineKey(action.payload));
    },
    itemQuantitySet: (
      state,
      action: PayloadAction<Pick<CartItem, "productId" | "variantId" | "quantity">>,
    ) => {
      const item = state.items.find((i) => lineKey(i) === lineKey(action.payload));
      if (!item) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((i) => lineKey(i) !== lineKey(action.payload));
      } else {
        item.quantity = action.payload.quantity;
      }
    },
    cartCleared: (state) => {
      state.items = [];
    },
    /** Replace the cart with items restored from persistence (client-only). */
    cartHydrated: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { itemAdded, itemRemoved, itemQuantitySet, cartCleared, cartHydrated } =
  cartSlice.actions;
export const cartReducer = cartSlice.reducer;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartSubtotal = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
