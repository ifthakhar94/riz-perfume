import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StoreProvider } from "@/store/StoreProvider";

import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const renderHeader = () =>
  render(
    <StoreProvider>
      <SiteHeader />
    </StoreProvider>,
  );

describe("SiteHeader", () => {
  it("renders the primary navigation items", () => {
    renderHeader();
    const nav = screen.getByRole("navigation", { name: /primary/i });
    expect(nav).toHaveTextContent(/home/i);
    expect(nav).toHaveTextContent(/shop/i);
    expect(nav).toHaveTextContent(/combo/i);
  });

  it("marks the current page in the nav", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("aria-current", "page");
  });

  it("renders search, account, and cart controls (no wishlist)", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /open search/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /account menu/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open cart/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/wishlist/i)).not.toBeInTheDocument();
  });

  it("shows an empty cart badge and zero subtotal by default", () => {
    renderHeader();
    expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
    expect(screen.getByRole("button", { name: /open cart/i })).toHaveTextContent("0.00 Tk");
  });

  it("opens the search panel when the search icon is clicked", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /open search/i }));
    expect(screen.getByRole("searchbox", { name: /search products/i })).toBeInTheDocument();
  });
});
