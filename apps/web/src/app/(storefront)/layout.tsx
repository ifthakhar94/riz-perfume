import { AnnouncementTicker } from "@/components/storefront/announcement-ticker";
import { SiteHeader } from "@/components/storefront/site-header";

/**
 * Active storefront promotion. Hardcoded per the current Figma design;
 * can be wired to the offers API later if promotions become dynamic.
 */
const ANNOUNCEMENT = "Eid Offer 15% discount on all combo";

/** Shared chrome for all customer-facing pages: ticker + header. */
export default function StorefrontLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AnnouncementTicker message={ANNOUNCEMENT} />
      <SiteHeader />
      {children}
    </>
  );
}
