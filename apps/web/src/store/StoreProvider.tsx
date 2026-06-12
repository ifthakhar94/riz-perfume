"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";

import { setupListeners } from "@reduxjs/toolkit/query";

import { setupCartPersistence } from "./cart/cart-storage";
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
    const unsubscribeListeners = setupListeners(storeRef.current.dispatch);
    // Restore the cart from localStorage and persist subsequent changes.
    // Runs post-mount so SSR markup and the first client render stay in sync.
    const unsubscribeCart = setupCartPersistence(storeRef.current);
    return () => {
      unsubscribeListeners();
      unsubscribeCart();
    };
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
