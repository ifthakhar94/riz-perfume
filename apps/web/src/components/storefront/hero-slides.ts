/**
 * Hero slider content (Figma node 73:3047). The design defines one slide;
 * add more entries here and the slider picks them up automatically.
 * Asset: export Figma node 73:3048 @2x to `public/hero/slide-1.png`.
 * Copy is verbatim from the design (including "personnality").
 */
import type { StaticImageData } from "next/image";
import SliderImage1 from "public/hero-slider/slider-1.jpg";
export interface HeroSlide {
  id: string;
  imageSrc: string | StaticImageData;
  imageAlt: string;
  heading: string;
  copy: string;
  ctaLabel: string;
  ctaHref: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "riz-special",
    imageSrc: SliderImage1,
    imageAlt: "Riz Perfume special collection",
    heading: "Riz Perfume Special",
    copy: "Express your personnality by choosing emblematic pieces for the Maison's fragrance wardrobe.",
    ctaLabel: "See Collection",
    ctaHref: "/shop",
  },
];
