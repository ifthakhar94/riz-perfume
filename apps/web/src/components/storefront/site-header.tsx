"use client";

import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/storefront/brand-logo";
import { HeaderCart } from "@/components/storefront/header-cart";
import { HeaderSearch } from "@/components/storefront/header-search";
import { HeaderUserMenu } from "@/components/storefront/header-user-menu";
import { MobileNav } from "@/components/storefront/mobile-nav";
import { NAV_ITEMS } from "@/components/storefront/nav-links";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_LINK_CLASSES =
  "flex h-12 items-center gap-1.5 px-4 text-xs uppercase tracking-[1px] transition-colors";

/**
 * Storefront header (Figma node 73:3009): logo · primary nav with dropdowns ·
 * search / account / cart cluster. 80px bar with 48px side insets on desktop;
 * hamburger sheet + condensed icons on mobile. Wishlist deliberately omitted.
 */
export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="relative border-b border-border/60 bg-background">
      <div className="flex h-20 items-center justify-between px-4 py-4 md:px-12">
        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-1">
          <MobileNav />
          <BrandLogo />
        </div>

        {/* Center: primary nav (desktop) */}
        <nav aria-label="Primary" className="hidden items-center gap-3 lg:flex">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger
                  className={cn(
                    NAV_LINK_CLASSES,
                    "text-brand-grey outline-none hover:text-primary data-[state=open]:text-primary",
                  )}
                >
                  {item.label}
                  <ChevronDown aria-hidden="true" className="size-4" strokeWidth={1.25} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.label} asChild>
                      <Link href={child.href}>{child.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cn(
                  NAV_LINK_CLASSES,
                  pathname === item.href ? "text-primary" : "text-brand-grey hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Right: search · account · cart */}
        <div className="flex items-center gap-4 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((prev) => !prev)}
            className="size-5 p-0 text-brand-grey hover:bg-transparent hover:text-primary"
          >
            <Search aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </Button>
          <HeaderUserMenu />
          <HeaderCart />
        </div>
      </div>

      <HeaderSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
