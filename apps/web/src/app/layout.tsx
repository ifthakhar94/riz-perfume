import type { Metadata, Viewport } from "next";
import { Jost, Libre_Baskerville } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { env } from "@/lib/env";
import { StoreProvider } from "@/store/StoreProvider";

import "./globals.css";

// Brand fonts: Libre Baskerville (display/serif) + Jost (UI/sans).
const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre",
  display: "swap",
});

const SITE_NAME = "Riz Perfume";
const SITE_TITLE = `${SITE_NAME} — Luxury Fragrances`;
const SITE_DESCRIPTION =
  "Riz Perfume — luxury fragrances crafted to leave a lasting impression. Discover our curated collection of perfumes and combos.";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Riz Perfume",
    "luxury perfume",
    "fragrance",
    "eau de parfum",
    "niche perfume",
    "designer perfume",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: env.NEXT_PUBLIC_SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#c41b35",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jost.variable} ${libreBaskerville.variable}`}
    >
      <body className="font-sans antialiased">
        <StoreProvider>{children}</StoreProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
