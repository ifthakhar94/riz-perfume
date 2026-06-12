import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Cart" };

/** Placeholder until the cart page ships — URL is final. */
export default function CartPage() {
  return <ComingSoon variant="store" />;
}
