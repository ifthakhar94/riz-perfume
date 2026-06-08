import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
