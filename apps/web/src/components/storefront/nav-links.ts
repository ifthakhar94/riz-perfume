/**
 * Storefront navigation model (Figma node 73:3013).
 * Dropdown children are static placeholders for now (agreed 2026-06-11);
 * wire to categories/types API when those pages ship.
 */
export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Best Sellers", href: "/shop?sort=best-sellers" },
    ],
  },
  {
    label: "Shop by Flavors",
    href: "/shop",
    children: [
      { label: "Floral", href: "/shop?flavor=floral" },
      { label: "Woody", href: "/shop?flavor=woody" },
      { label: "Citrus", href: "/shop?flavor=citrus" },
      { label: "Oriental", href: "/shop?flavor=oriental" },
    ],
  },
  { label: "Combo", href: "/combo" },
];
