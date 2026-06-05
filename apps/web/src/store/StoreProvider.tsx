"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";

import { setupListeners } from "@reduxjs/toolkit/query";

import { makeStore, type AppStore } from "./index";

/**
 * Client-side Redux provider. The store is created once and held in a ref so it
 * is stable across re-renders, following the official Next.js + RTK pattern.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  storeRef.current ??= makeStore();

  useEffect(() => {
    if (!storeRef.current) return;
    // Enables `refetchOnFocus` / `refetchOnReconnect` behaviour.
    const unsubscribe = setupListeners(storeRef.current.dispatch);
    return unsubscribe;
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
