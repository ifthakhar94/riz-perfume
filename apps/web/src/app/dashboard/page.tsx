import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Riz Perfume admin dashboard.",
  alternates: { canonical: "/dashboard" },
  // The admin area must never be indexed by search engines.
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <ComingSoon variant="dashboard" />;
}
