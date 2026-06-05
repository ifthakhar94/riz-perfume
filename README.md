# Riz Perfume

A high-performance, SEO-first e-commerce platform for **Riz Perfume**. Built as a
TypeScript monorepo with security, reliability, and scalability as first-class
concerns.

> **Status:** Phase 1 — production-ready foundation. Both the public site (`/`)
> and the admin dashboard (`/dashboard`) currently render a branded
> "Coming Soon" page. Authentication, RBAC, and domain entities arrive in the
> next phase.

---

## Tech stack

| Area     | Choices                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| Monorepo | pnpm workspaces + Turborepo                                                                                              |
| Frontend | Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Redux Toolkit + RTK Query · shadcn/ui-ready · Server Components |
| Backend  | Node.js · Express · TypeORM · PostgreSQL · Zod env validation · Pino logging                                             |
| Tooling  | ESLint (flat config) · Prettier · Husky · lint-staged · Commitlint · Vitest                                              |
| CI       | GitHub Actions (lint → typecheck → test → build)                                                                         |

## Repository layout

```
riz-perfume/
├── apps/
│   ├── web/                 # Next.js public site + admin dashboard
│   │   └── src/
│   │       ├── app/         # App Router routes, SEO (robots/sitemap/manifest)
│   │       ├── components/  # UI + shadcn-ready primitives
│   │       ├── store/       # Redux Toolkit store + RTK Query
│   │       └── lib/         # env validation, utils
│   └── api/                 # Express + TypeORM REST API
│       └── src/
│           ├── config/      # env (zod) + TypeORM data source
│           ├── lib/         # pino logger
│           ├── middleware/  # error handler, 404
│           ├── modules/     # feature modules (health, ...)
│           ├── routes/      # API router
│           └── utils/       # AppError, asyncHandler
├── packages/
│   ├── shared/              # Types/contracts shared across web & api (types-only)
│   ├── tsconfig/            # Shared strict TypeScript base configs
│   └── eslint-config/       # Shared ESLint flat config
├── .github/workflows/ci.yml # CI gate
├── .husky/                  # Git hooks (pre-commit, commit-msg, pre-push)
├── turbo.json               # Turborepo task graph
└── pnpm-workspace.yaml
```

## Prerequisites

- **Node.js** `>= 20` (a `.nvmrc` pins the recommended LTS — run `nvm use`)
- **pnpm** `>= 11` (`corepack enable && corepack prepare pnpm@latest --activate`)
- **PostgreSQL** running locally (Homebrew: `brew services start postgresql`)

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Create the local database (one-time)
createdb riz_perfume

# 4. Run everything in dev (web on :3000, api on :4000)
pnpm dev
```

- Public site → http://localhost:3000
- Admin dashboard → http://localhost:3000/dashboard
- API health check → http://localhost:4000/api/health

> The API boots even when the database is unreachable (degraded mode); the
> health endpoint reports the database status and returns `503` until it
> connects.

## Scripts (run from the repo root)

| Command          | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `pnpm dev`       | Run all apps in watch mode (Turborepo)                  |
| `pnpm build`     | Production build of every package                       |
| `pnpm lint`      | ESLint across the workspace                             |
| `pnpm typecheck` | `tsc --noEmit` across the workspace                     |
| `pnpm test`      | Run all Vitest suites                                   |
| `pnpm format`    | Prettier write                                          |
| `pnpm check`     | lint + typecheck + test + build (the full quality gate) |

Each app also exposes its own scripts (e.g. `pnpm --filter @riz/api dev`).

## Git workflow & quality gates

Quality is enforced automatically, so broken code cannot reach the remote:

- **pre-commit** — `lint-staged` runs ESLint (`--fix`) + Prettier on staged files
- **commit-msg** — Commitlint enforces [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat`, `fix`, `chore`, …; allowed scopes: `web`, `api`, `shared`, `config`,
  `repo`, `ci`, `deps`, `release`)
- **pre-push** — the full gate runs and **blocks the push on any failure**:

  ```
  lint → typecheck → test → build
  ```

The same steps run in CI on every push to `main` and on every pull request.

Example commit:

```
feat(web): add coming soon page for the public site
```

## Security & SEO foundations

- **API**: Helmet, CORS allow-list, rate limiting, compression, body-size limits,
  centralized error envelope, secret redaction in logs, env validation that
  fails fast.
- **Web**: security headers (CSP-friendly defaults, `X-Frame-Options`, etc.),
  `poweredByHeader` disabled, validated public env, full metadata API
  (`robots.txt`, `sitemap.xml`, `manifest`, Open Graph/Twitter), and the admin
  area is `noindex`.

## Roadmap (next phases)

1. **Auth & RBAC** — JWT auth, refresh tokens, `User` entity + migrations, role
   guards (`admin` / `manager` / `customer`).
2. **Catalog** — products, variants, categories, media, search.
3. **Commerce** — cart, checkout, orders, payments.
4. **Dashboard** — real admin UI (catalog/orders/customers/analytics).
5. **Observability** — error monitoring (Sentry-ready), metrics, tracing.

See `ARCHITECTURE` notes maintained by the team for decision history.
