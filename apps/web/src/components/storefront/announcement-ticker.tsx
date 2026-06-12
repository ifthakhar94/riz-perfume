import { cn } from "@/lib/utils";

/**
 * Copies of the message per marquee group. Six copies (~3.6k px at the
 * desktop gap) keep the strip wider than any common viewport so the loop
 * never shows a blank seam.
 */
const REPEAT_COUNT = 6;

interface AnnouncementTickerProps {
  /** Announcement copy, e.g. an active promotion. */
  message: string;
  className?: string;
}

/**
 * Scrolling announcement bar at the very top of the storefront.
 * Figma: Home → "Frame 4" (node 73:3002) — 32px crimson bar, white Jost
 * 16px text repeated with a 350px gap.
 *
 * Accessibility: the message is exposed to assistive tech exactly once via
 * a visually hidden paragraph; the animated track is decorative repetition
 * and is `aria-hidden`. The animation pauses for `prefers-reduced-motion`.
 *
 * Rendered as a Server Component — no client-side JS needed (CSS marquee).
 */
export function AnnouncementTicker({ message, className }: AnnouncementTickerProps) {
  const copies = Array.from({ length: REPEAT_COUNT }, (_, index) => index);

  return (
    <section
      aria-label="Announcement"
      className={cn("h-8 overflow-hidden bg-primary py-1 text-primary-foreground", className)}
    >
      <p className="sr-only">{message}</p>
      <div
        aria-hidden="true"
        className="flex h-full w-max animate-ticker items-center motion-reduce:animate-none"
      >
        {[0, 1].map((group) => (
          <div
            key={group}
            className="flex shrink-0 items-center gap-x-24 pr-24 md:gap-x-[350px] md:pr-[350px]"
          >
            {copies.map((copy) => (
              <span key={copy} className="text-base whitespace-nowrap">
                {message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
