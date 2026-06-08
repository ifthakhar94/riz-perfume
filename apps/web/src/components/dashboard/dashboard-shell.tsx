"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Loader2 } from "lucide-react";

import { useGetMeQuery } from "@/store/api/authApi";
import { BrandMark } from "./brand-mark";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";

/**
 * Client-side guard + chrome for the admin panel. Verifies the session via
 * `GET /auth/me` (which transparently refreshes the token), and only renders
 * the dashboard for an authenticated ADMIN. The API enforces the real RBAC.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useGetMeQuery();

  const isAuthorized = Boolean(user && user.role === "ADMIN");

  useEffect(() => {
    if (!isLoading && (isError || (user && user.role !== "ADMIN"))) {
      router.replace("/dashboard/login");
    }
  }, [isLoading, isError, user, router]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-muted/30">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-background md:flex">
        <div className="border-b px-5 py-4">
          <BrandMark />
        </div>
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
