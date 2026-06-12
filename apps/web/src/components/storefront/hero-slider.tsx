"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { HERO_SLIDES, type HeroSlide } from "@/components/storefront/hero-slides";
import { cn } from "@/lib/utils";

/** Minimum horizontal swipe distance (px) to change slide on touch. */
const SWIPE_THRESHOLD = 48;

interface HeroSliderProps {
  slides?: HeroSlide[];
}

/**
 * Full-bleed hero banner/slider under the header (Figma node 73:3047):
 * 476px image, left-aligned text block (Libre Baskerville 48px heading,
 * Jost 14px sub-copy at 80% white), gradient CTA, square 24px arrows at the
 * vertical center, 32px from the edges. Dependency-free: translated flex
 * track + touch swipe. Arrows only render with 2+ slides.
 */
export function HeroSlider({ slides = HERO_SLIDES }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const count = slides.length;

  const goTo = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null || count < 2) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) goTo(delta < 0 ? index + 1 : index - 1);
    touchStartX.current = null;
  };

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative w-full overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Track */}
      <div
        className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, slideIndex) => (
          <article
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} of ${count}`}
            aria-hidden={slideIndex !== index}
            className="relative h-[320px] w-full shrink-0 md:h-[420px] lg:h-[476px]"
          >
            <Image
              src={slide.imageSrc}
              alt={slide.imageAlt}
              fill
              priority={slideIndex === 0}
              sizes="100vw"
              className="object-cover"
            />
            {/* Text block: 72px left inset, vertically centered (Figma 73:3049) */}
            <div className="absolute inset-y-0 left-0 flex max-w-[497px] flex-col justify-center gap-5 px-6 md:px-[72px]">
              <div className="flex flex-col gap-2">
                <h1 className="font-serif text-3xl text-white md:text-5xl md:leading-[60px]">
                  {slide.heading}
                </h1>
                <p className="text-sm leading-[22px] text-white/80">{slide.copy}</p>
              </div>
              <Link
                href={slide.ctaHref}
                tabIndex={slideIndex === index ? 0 : -1}
                className="inline-flex h-8 w-fit items-center bg-gradient-to-b from-[#EE3D4E] to-[#C51C36] px-4 text-xs font-medium tracking-[1px] text-white uppercase transition-opacity hover:opacity-90"
              >
                {slide.ctaLabel}
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Arrows (Figma 73:3055 / 73:3058): 24px squares, white 40%, centered */}
      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className={cn(
              "absolute top-1/2 left-4 flex size-6 -translate-y-1/2 items-center justify-center md:left-8",
              "bg-white/40 text-brand-grey transition-colors hover:bg-white/70",
            )}
          >
            <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className={cn(
              "absolute top-1/2 right-4 flex size-6 -translate-y-1/2 items-center justify-center md:right-8",
              "bg-white/40 text-brand-grey transition-colors hover:bg-white/70",
            )}
          >
            <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
          </button>
        </>
      ) : null}
    </section>
  );
}
