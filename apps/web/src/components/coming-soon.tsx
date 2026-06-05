import { cn } from "@/lib/utils";

type ComingSoonVariant = "store" | "dashboard";

interface ComingSoonProps {
  variant?: ComingSoonVariant;
  className?: string;
}

const COPY: Record<ComingSoonVariant, { eyebrow: string; title: string; description: string }> = {
  store: {
    eyebrow: "Riz Perfume",
    title: "Something beautiful is coming.",
    description:
      "Our online boutique is being crafted with care. Soon you will discover a curated collection of luxury fragrances designed to leave a lasting impression.",
  },
  dashboard: {
    eyebrow: "Riz Perfume · Admin",
    title: "The dashboard is on its way.",
    description:
      "The Riz Perfume control center is under construction. Catalog, orders, customers, and analytics will live here shortly.",
  },
};

/**
 * Branded "Coming Soon" screen shared by the public site and the admin
 * dashboard. Rendered as a Server Component for fast, SEO-friendly delivery.
 */
export function ComingSoon({ variant = "store", className }: ComingSoonProps) {
  const copy = COPY[variant];
  const year = new Date().getFullYear();

  return (
    <main
      className={cn(
        "relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-neutral-950 px-6 text-neutral-100",
        className,
      )}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-amber-200/5 blur-3xl"
      />

      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.35em] text-amber-200/80">
          {copy.eyebrow}
        </p>
        <h1 className="text-balance font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
          {copy.title}
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-neutral-400 sm:text-lg">
          {copy.description}
        </p>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/5 px-4 py-2 text-sm text-amber-100/90">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
          </span>
          Launching soon
        </div>
      </div>

      <footer className="relative z-10 mt-16 text-xs text-neutral-600">
        © {year} Riz Perfume. All rights reserved.
      </footer>
    </main>
  );
}
