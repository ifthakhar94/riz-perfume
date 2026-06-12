import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/** "perfume-noir-intense" → "Perfume Noir Intense" */
const humanizeSlug = (slug: string) =>
  decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: humanizeSlug(slug) };
}

/**
 * Single product page — URL structure is final (`/products/[slug]`, slugs come
 * from ProductListItemDto.slug); the page itself is still in design.
 */
export default function ProductPage() {
  return <ComingSoon variant="store" />;
}
