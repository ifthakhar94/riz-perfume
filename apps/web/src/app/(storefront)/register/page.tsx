import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Create Account" };

/** Placeholder until shopper registration ships — URL is final. */
export default function RegisterPage() {
  return <ComingSoon variant="store" />;
}
