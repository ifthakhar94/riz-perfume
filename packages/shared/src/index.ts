/**
 * @riz/shared — types and contracts shared between the API and the web app.
 *
 * IMPORTANT: This package intentionally contains TYPES ONLY (no runtime code).
 * Consumers should import from it with `import type { ... }` so the import is
 * fully erased at build time and there is no runtime dependency to bundle.
 * When we later add runtime helpers (e.g. shared zod schemas), revisit the
 * build setup to compile this package to JS.
 */

export * from "./api";
export * from "./auth";
export * from "./catalog";
export * from "./commerce";
export * from "./domain";
export * from "./finance";
export * from "./offer";
export * from "./order";
