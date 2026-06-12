import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Sign In" };

/** Placeholder until shopper sign-in ships — URL is final. */
export default function LoginPage() {
  return <ComingSoon variant="store" />;
}
