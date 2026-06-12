import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Profile" };

/** Placeholder until the account profile page ships — URL is final. */
export default function ProfilePage() {
  return <ComingSoon variant="store" />;
}
