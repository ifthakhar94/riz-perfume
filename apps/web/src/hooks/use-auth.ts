"use client";

import { useAppSelector } from "@/store/hooks";

/** Convenience accessor for the current auth state (user + status). */
export function useAuth() {
  const auth = useAppSelector((state) => state.auth);
  return {
    user: auth.user,
    status: auth.status,
    isAuthenticated: auth.status === "authenticated" && Boolean(auth.user),
    isAdmin: auth.user?.role === "ADMIN",
  };
}
