import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Storefront logo (Figma node 73:3010 — mark + wordmark, 155×48 box).
 * Asset: export node 73:3010 from Figma as PNG @4x to `public/brand/logo.png`.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Riz Perfume — home"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src="/brand/logo.png"
        alt="Riz Perfume"
        width={155}
        height={48}
        priority
        className="h-10 w-auto md:h-12"
      />
    </Link>
  );
}
