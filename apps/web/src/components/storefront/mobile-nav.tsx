"use client";

import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { NAV_ITEMS } from "@/components/storefront/nav-links";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Hamburger + slide-out navigation for < lg viewports. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="text-brand-grey hover:text-primary lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" strokeWidth={1.5} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-left text-base">Riz Perfume</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="mt-2 flex flex-col px-4 pb-6">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <details key={item.label} className="group border-b border-border">
                <summary className="text-brand-grey flex cursor-pointer list-none items-center justify-between py-3 text-xs tracking-[1px] uppercase [&::-webkit-details-marker]:hidden">
                  {item.label}
                  <ChevronDown
                    aria-hidden="true"
                    className="size-4 transition-transform group-open:rotate-180"
                    strokeWidth={1.25}
                  />
                </summary>
                <ul className="pb-3 pl-3">
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <Link
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="text-brand-grey block py-2 text-sm hover:text-primary"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "border-b border-border py-3 text-xs tracking-[1px] uppercase",
                  pathname === item.href ? "text-primary" : "text-brand-grey hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
