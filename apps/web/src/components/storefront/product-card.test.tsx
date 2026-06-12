import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import type { ProductListItemDto, ProductVariantDto } from "@riz/shared";

import { makeStore } from "@/store";
import { selectCartItems } from "@/store/cart/cartSlice";

import { ProductCard } from "./product-card";

const product: ProductListItemDto = {
  id: 1,
  name: "Noir Intense",
  slug: "noir-intense",
  imageUrl: null,
  imageAlt: null,
  isActive: true,
  categories: [{ id: 1, name: "Featured" }],
  fromPrice: 850,
  createdAt: "2026-06-01T00:00:00.000Z",
};

const variant = (
  id: number,
  type: string,
  typeId: number,
  size: string,
  price: number,
  stockQuantity = 10,
): ProductVariantDto => ({
  id,
  price,
  sku: `SKU-${id}`,
  stockQuantity,
  isActive: true,
  size: { id, name: size },
  type: { id: typeId, name: type },
});

const VARIANTS = [
  variant(11, "Spray", 1, "3ml", 850),
  variant(12, "Spray", 1, "5ml", 1250),
  variant(21, "Oil", 2, "3ml", 950),
];

const setup = () => {
  const store = makeStore();
  render(
    <Provider store={store}>
      <ProductCard product={product} variants={VARIANTS} />
    </Provider>,
  );
  return store;
};

describe("ProductCard", () => {
  it("shows name, link to the product page, and the from-price", () => {
    setup();
    expect(screen.getByRole("link", { name: "Noir Intense" })).toHaveAttribute(
      "href",
      "/products/noir-intense",
    );
    // Closed picker with known variants → BDT price range.
    expect(screen.getByTestId("price-line")).toHaveTextContent("BDT 850.00 - BDT 1,250.00");
  });

  it("reveals type and size choices when the picker opens", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /choose options/i }));
    expect(screen.getByRole("button", { name: "Spray" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Oil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3ml" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5ml" })).toBeInTheDocument();
  });

  it("updates the price line when a different type/size is selected", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /choose options/i }));
    // Open picker: default selection is first type (Spray), first size (3ml).
    expect(screen.getByTestId("price-line")).toHaveTextContent("BDT 850.00");

    fireEvent.click(screen.getByRole("button", { name: "5ml" }));
    expect(screen.getByTestId("price-line")).toHaveTextContent("BDT 1,250.00");

    // Switching type falls back to its first size (Oil only has 3ml → 950)
    fireEvent.click(screen.getByRole("button", { name: "Oil" }));
    expect(screen.getByTestId("price-line")).toHaveTextContent("BDT 950.00");
  });

  it("adds the selected variant to the cart", () => {
    const store = setup();
    fireEvent.click(screen.getByRole("button", { name: /choose options/i }));
    fireEvent.click(screen.getByRole("button", { name: "5ml" }));
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    const items = selectCartItems(store.getState());
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      productId: 1,
      variantId: 12,
      variantLabel: "Spray · 5ml",
      unitPrice: 1250,
      quantity: 1,
    });
  });

  it("disables add-to-cart for out-of-stock variants", () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <ProductCard product={product} variants={[variant(31, "Spray", 1, "3ml", 850, 0)]} />
      </Provider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /choose options/i }));
    expect(screen.getByRole("button", { name: /out of stock/i })).toBeDisabled();
  });
});
