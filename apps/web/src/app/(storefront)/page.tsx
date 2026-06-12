import { Suspense } from "react";

import { HeroSlider } from "@/components/storefront/hero-slider";
import { ProductSection } from "@/components/storefront/product-section";

export default function HomePage() {
  return (
    <main>
      <HeroSlider />
      {/* Suspense: ProductSection reads the category from useSearchParams. */}
      <Suspense>
        <ProductSection />
      </Suspense>
      {/* Next sections: 73:3200 grid, 73:3217 banner, 73:3218, testimonials. */}
    </main>
  );
}
