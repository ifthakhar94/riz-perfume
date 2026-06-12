import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Shop" };

/** Placeholder until the shop/listing page ships — URL is final. */
export default function ShopPage() {
  return <ComingSoon variant="store" />;
}
