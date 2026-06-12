import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { makeStore, type AppStore } from "@/store";
import { itemAdded, selectCartItems } from "@/store/cart/cartSlice";

import { CartDrawer } from "./cart-drawer";

const addItem = (store: AppStore, overrides = {}) =>
  store.dispatch(
    itemAdded({
      productId: 1,
      variantId: 12,
      variantLabel: "Spray · 5ml",
      name: "Noir Intense",
      slug: "noir-intense",
      imageUrl: null,
      unitPrice: 1250,
      quantity: 1,
      ...overrides,
    }),
  );

const renderDrawer = (store: AppStore) =>
  render(
    <Provider store={store}>
      <CartDrawer open onOpenChange={() => {}} trigger={<button type="button">Cart</button>} />
    </Provider>,
  );

describe("CartDrawer", () => {
  it("shows an empty state with a continue-shopping link", () => {
    renderDrawer(makeStore());
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue shopping/i })).toHaveAttribute(
      "href",
      "/shop",
    );
  });

  it("lists items with variant label, line total, and subtotal", () => {
    const store = makeStore();
    addItem(store, { quantity: 2 });
    renderDrawer(store);

    expect(screen.getByText(/your cart \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText("Spray · 5ml")).toBeInTheDocument();
    // Line total (2 × 1250) appears alongside the subtotal.
    expect(screen.getAllByText("2,500.00 Tk")).toHaveLength(2);
  });

  it("increments and decrements quantity with the steppers", () => {
    const store = makeStore();
    addItem(store);
    renderDrawer(store);

    fireEvent.click(screen.getByRole("button", { name: /increase quantity/i }));
    expect(selectCartItems(store.getState())[0]?.quantity).toBe(2);

    fireEvent.click(screen.getByRole("button", { name: /decrease quantity/i }));
    expect(selectCartItems(store.getState())[0]?.quantity).toBe(1);

    // Decrementing at quantity 1 removes the line entirely.
    fireEvent.click(screen.getByRole("button", { name: /decrease quantity/i }));
    expect(selectCartItems(store.getState())).toHaveLength(0);
  });

  it("removes a line with the remove button", () => {
    const store = makeStore();
    addItem(store);
    renderDrawer(store);

    fireEvent.click(screen.getByRole("button", { name: /remove noir intense/i }));
    expect(selectCartItems(store.getState())).toHaveLength(0);
  });

  it("links the checkout CTA to the cart page", () => {
    const store = makeStore();
    addItem(store);
    renderDrawer(store);
    expect(screen.getByRole("link", { name: /checkout/i })).toHaveAttribute("href", "/cart");
  });
});
