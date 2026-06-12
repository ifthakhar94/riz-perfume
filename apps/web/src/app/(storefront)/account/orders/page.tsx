import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "My Orders" };

/** Placeholder until the order history page ships — URL is final. */
export default function OrdersPage() {
  return <ComingSoon variant="store" />;
}
