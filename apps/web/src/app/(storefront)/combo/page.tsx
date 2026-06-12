import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Combo" };

/** Placeholder until the combo page ships — URL is final. */
export default function ComboPage() {
  return <ComingSoon variant="store" />;
}
