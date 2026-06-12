# Riz Perfume — Project Context

Full-stack perfume e-commerce monorepo. This file is the persistent working
context — **update it whenever decisions are made or storefront sections ship.**

## Stack (fixed — do not introduce new frameworks)

- Monorepo: pnpm@11.5.2 workspaces + Turborepo
- `apps/api` (@riz/api): Express 4 + TS (CommonJS), TypeORM 0.3 + PostgreSQL
  (local port 5433), JWT access+refresh auth, bcryptjs, Zod. → http://localhost:4000
- `apps/web` (@riz/web): Next.js 15 App Router + React 19 + TS, Redux Toolkit +
  RTK Query, Tailwind v4, shadcn/ui, Cloudinary. → http://localhost:3000
- `packages/shared` (@riz/shared): shared TS types only (no runtime)

## Status

- Backend: DONE — 15 modules, ~59 endpoints (auth/RBAC, catalog, variants,
  costs, courier charges, orders w/ auto offer application, offers, finance, users).
  Postman collection in `postman/` auto-captures tokens.
- Admin dashboard (`/dashboard`): DONE — RTK Query + token-refresh flow,
  Cloudinary uploads, all management screens.
- **Customer storefront: IN PROGRESS** — built from Figma designs.

## Storefront decisions (agreed 2026-06-11)

- Lives at `/` in the same `apps/web` app (alongside `dashboard/`).
- Auth: reuse existing auth module/registration for shoppers; guest checkout supported.
- Cart: client-side Redux only (no cart API).
- Product data: existing API endpoints suffice; new public routes only if flagged.
- Storefront components live in `src/components/storefront/`.

## Figma design source

- File: https://www.figma.com/design/PH41XWtREy01XpuoRS5Ev2/Riz-Perfume--Copy-
- Landing page frame: "Home" node `73:3001` (1440px wide). Sections top→bottom:
  1. `73:3002` Announcement ticker (32px) — ✅ BUILT
  2. `73:3009` Header/nav (80px) — logo, menu, icons, "0.00 Tk" cart total
  3. `73:3047` Hero image slider (476px) — arrows + CTA
  4. `73:3061` Product section (563px) — filter buttons, "1/7" pager
  5. `73:3200` Section w/ heading + grid (683px)
  6. `73:3217` Full-bleed banner image (659px, 48px side insets)
  7. `73:3218` Section w/ heading + content (561px)
  8. `73:3245` Testimonials (619px)
  9. `77:6056` Footer (324px)
- Access: figma-console MCP REST API works without Desktop Bridge
  (`figma_get_component_for_development` with fileUrl + nodeId).

## Design system (from Figma + globals.css)

- Brand crimson: `#C41B35` = CSS token `--primary` (`bg-primary`). Button
  gradient: #EE3D4E → #C51C36. Secondary text grey: #53545C. Background: white.
- Fonts (already wired in `layout.tsx` via next/font, exposed as Tailwind
  `font-sans`/`font-serif`): **Jost** (body/UI, 400/500) and
  **Libre Baskerville** (headings).

## Conventions

- Match existing code style; reuse components/utilities before adding new ones.
- Frontend data access only via RTK Query slices (no ad-hoc fetch/axios).
- Shared request/response types in @riz/shared.
- Conventional commits; never commit unless asked. commitlint enforces
  scope-enum: **web, api, shared, config, repo, ci, deps, release**
  (cross-cutting changes → `repo`). Subject must be lower-case type(scope).
- Tests: vitest + @testing-library, colocated `*.test.tsx`.
- Verification: `pnpm typecheck` / `test` / `lint` in `apps/web`.

## Storefront build log

- 2026-06-11 — Removed Coming Soon from `/` (`app/page.tsx`); updated layout
  metadata + themeColor. Built `AnnouncementTicker`
  (`components/storefront/announcement-ticker.tsx`): 32px `bg-primary` bar,
  white Jost 16px, message "Eid Offer 15% discount on all combo" repeated with
  350px gap (96px mobile), pure-CSS marquee (`--animate-ticker` keyframes in
  `globals.css`, 40s loop, duplicated track → translateX(-50%)), sr-only message
  once + aria-hidden track, reduced-motion safe. 4 unit tests. Promo string is
  a constant — wire to offers API later if needed.
- 2026-06-11 — **Header/nav (`73:3009`) BUILT.** Storefront moved into route
  group `app/(storefront)/` with `layout.tsx` (ticker + `SiteHeader` chrome).
  Components (all in `components/storefront/`): `site-header.tsx` (80px bar,
  48px side insets desktop, justify-between), `nav-links.ts` (static nav model:
  Home / Shop▾ / Shop by Flavors▾ / Combo — dropdowns are STATIC placeholder
  links per agreement; wire to categories/types API later), `brand-logo.tsx`
  (next/image `/brand/logo.png` — **asset must be exported from Figma node
  73:3010 @4x to `apps/web/public/brand/logo.png`**, not yet done),
  `header-search.tsx` (search icon toggles panel under header; `useDebounce`
  hook (new, `hooks/use-debounce.ts`, 300ms), min 2 chars, `useGetProductsQuery
{search,pageSize:6}`, skeletons, results link `/products/[slug]`, Esc/X
  closes), `header-user-menu.tsx` (auth-aware shadcn DropdownMenu: guest →
  Sign in/Create account; authed → fullname/email, Profile, Orders, Log out via
  useLogoutMutation+clearCredentials), `header-cart.tsx` (badge 16px
  `bg-brand-blush` text-primary + subtotal "0.00 Tk" via new `formatTk` in
  lib/format.ts), `mobile-nav.tsx` (shadcn Sheet hamburger <lg, `<details>`
  groups). Wishlist intentionally skipped. Nav typography: Jost 12px uppercase
  tracking-[1px]; icons lucide 20px stroke 1.5 `text-brand-grey`; active nav =
  text-primary. New tokens in globals.css: `--color-brand-grey #53545C`,
  `--color-brand-blush #F9E8EB`.
- Cart state: `store/cart/cartSlice.ts` (client-only): items keyed by
  productId+variantId; actions itemAdded/itemRemoved/itemQuantitySet/
  cartCleared; selectors selectCartItems/Count/Subtotal. Registered in store.
- Placeholder routes (all render `ComingSoon`, URLs FINAL): `/products/[slug]`
  (slug from ProductListItemDto, humanized metadata title), `/shop`, `/combo`,
  `/cart`, `/login`, `/register`, `/account/profile`, `/account/orders`.
- next.config.ts: added Cloudinary `images.remotePatterns` (res.cloudinary.com).
- Useful API facts: `GET /products` is public, params
  `{page,pageSize,search,categoryId}` → `Paginated<ProductListItemDto>`
  (`.items`); `PublicUser.fullname` (not `.name`); `useAuth()` hook;
  authApi `useLogoutMutation`; figma-console REST works w/o Desktop Bridge,
  `figma_get_component_image` exports node renders.
- Tests: cartSlice (6), use-debounce (3), site-header (5), ticker (4).
  No @testing-library/user-event installed — use fireEvent.
- 2026-06-11 — **Hero slider (`73:3047`) BUILT.** `hero-slider.tsx` +
  `hero-slides.ts` (content array — design has ONE slide; add entries to get a
  working slider). Full-bleed, h-320/420/476 responsive; text block 72px left
  inset (24px mobile), max-w-[497px]: serif 48px white heading, Jost 14/22
  white/80 copy (verbatim incl. "personnality" typo), gradient CTA
  (#EE3D4E→#C51C36, h-32px, uppercase 12px tracking-1px, square corners) →
  /shop. Arrows: 24px squares bg-white/40 chevron brand-grey, 32px from edges,
  vertically centered, only render with 2+ slides, loop, touch-swipe (48px
  threshold), translateX track + duration-500, reduced-motion safe,
  carousel/slide ARIA. 4 unit tests. **Asset needed: export Figma node
  73:3048 @2x → `apps/web/public/hero/slide-1.png`** (not yet done).
- 2026-06-11 — **Product section (`73:3061`) BUILT** (⚠️ from design language,
  NOT pixel-matched — Figma REST was rate-limited (429, long-window); verify
  against Figma when it resets: section heading text is a GUESS
  ("Our Collection"), tabs/card/pager styling needs comparison).
  `product-card.tsx` — REUSABLE card (shop page later): aspect-[4/5] image,
  hover (mouseenter) or bag-toggle (<md, no hover) reveals variant picker
  panel; lazily fetches public `GET /products/[slug]` via NEW
  `useLazyGetProductBySlugQuery` in productsApi (skipped if `variants` prop
  passed — that's how tests avoid network); type chips → size chips → price
  per selected variant (chips: selected bg-primary, else border brand-grey);
  add-to-cart dispatches itemAdded w/ variantId + `variantLabel`
  ("Spray · 5ml" — NEW field on CartItem) + sonner toast; out-of-stock
  variants disable the button. `product-section.tsx` — heading + "All" +
  active categories from getCategories as filter buttons (selected
  bg-primary), 4-per-page grid (2-col mobile), pager "‹ 1/7 ›" wired to API
  `pagination.totalPages` (page in primary, arrows 24px bordered squares),
  skeletons + empty state. Cart drawer `cart-drawer.tsx` (NO Figma design —
  own design, brand-aligned): shadcn Sheet right, lines w/ image, variant
  label, qty steppers (− qty + ; 0 ⇒ line removed), remove X, subtotal,
  "delivery at checkout" note, gradient Checkout CTA → /cart, empty state →
  /shop. `header-cart.tsx` now opens the drawer (button, was Link) — header
  badge/subtotal react to cart automatically.
- Hero slides: user switched `hero-slides.ts` to static import
  (`public/hero-slider/slider-1.jpg`, StaticImageData) — assets live in
  `public/hero-slider/`, keep that pattern.
- Tests now: ticker 4, site-header 5 (cart = button "Open cart"), hero 4,
  cartSlice 6, use-debounce 3, product-card 5, cart-drawer 5.
- 2026-06-11 — **Product section TUNED to user's full-page screenshot** (Figma
  REST still rate-limited; screenshot is the reference). Changes: NO section
  heading — filter buttons top-LEFT, "1/7" pager + borderless chevrons
  top-RIGHT (same row); thin progress bar under grid (dark segment =
  page/totalPages); product prices use **formatBDT ranges**
  ("BDT 600.00 - BDT 19,200.00"): range once variants known, fromPrice before,
  exact variant price while picker open; picker panel solid white + border +
  shadow; add-to-cart = solid bg-primary, plain "ADD TO CART" (no price).
  Screenshot features deliberately SKIPPED (no API data): "SAVE 20%" badge
  (list DTO has no discount), ★ ratings (no ratings module), wishlist hearts
  (feature skipped). Full landing design from screenshot, later sections:
  "Shop by category" (3 image cards: Oil/Spray/Combo), full-bleed brand
  banner ("Timeless scent…" + Discover Now), "Shop by Note" (4 cards:
  Aquatic/Spicy/Fruity/Floral), "Real Scent Lovers, Real Reviews"
  (influencer cards w/ quotes + stat chips), footer (brand blurb, Client
  Services / Our Links / Social columns, payment icons).
- 2026-06-11 — Product section refinements: category filter synced to URL
  (`/?category=ID` via useSearchParams + router.replace scroll:false; page
  resets on category change; `<Suspense>` wraps ProductSection in page.tsx).
  ProductCard picker restructured: panel now expands BELOW the card
  (absolute top-full, z-20, shadow — overlays content beneath, like the
  design) instead of covering the image; name+price always visible; type
  chips + divider + size chips in ONE row (side by side per design).
- 2026-06-11 — **Cart persistence** (no new deps): `store/cart/cart-storage.ts`
  — localStorage key `riz-perfume:cart:v1` (versioned), per-item structural
  validation on read (corrupt/invalid → []), `setupCartPersistence(store)`
  hydrates via new `cartHydrated` action POST-MOUNT (in StoreProvider
  useEffect, avoids SSR hydration mismatch) + store.subscribe write-through
  on items reference change. try/catch for private-mode storage. 4 tests.
- 2026-06-11 — **Category slugs** (backend + frontend): `Category.slug`
  (varchar 180, unique) + migration `1749900000000-AddCategorySlug`
  (backfills slugify(name), collision → `-{id}` suffix; **run
  `pnpm migration:run` / typeorm migrations in apps/api before next start**).
  categories.controller auto-generates slug on create AND on name update
  (slug follows name — old URLs break by design). `GET /products` accepts
  NEW `category` (slug) query param alongside `categoryId` (subquery join on
  categories.slug). CategoryDto.slug in shared. Storefront URL now
  `/?category=wood`; ProductSection reads slug from URL, passes
  `category` to getProducts, FilterButton matches by slug.

## Session end 2026-06-11 — open items (check these first next session)

1. **Verify category-slug migration ran**: user was running
   `pnpm --filter @riz/api migration:run` (initially tried from repo root,
   which fails — script lives in apps/api). If not applied, API errors with
   `column "slug" does not exist` on /categories and /products?category=…
2. Confirm logo asset exists at `apps/web/public/brand/logo.png` (export of
   Figma node 73:3010 @4x). Hero asset done (`public/hero-slider/slider-1.jpg`).
3. Run `pnpm --filter @riz/web test` locally — tests were written but never
   executed (Claude's sandbox can't run vitest: macOS-native binaries).
   Counts: ticker 4, site-header 5, hero 4, cartSlice 6, use-debounce 3,
   product-card 5, cart-drawer 5, cart-storage 4.
4. Figma REST may still be 429-rate-limited; user-provided full-page
   screenshot (2026-06-11) is the design reference for remaining sections.
5. NEXT section to build: `73:3200` **"Shop by category"** — serif heading
   left + sub-copy, 3 image cards (Oil Perfume / Spray perfume / Combo
   Perfumes), then brand banner (73:3217), Shop by Note (73:3218),
   testimonials (73:3245), footer (77:6056).
