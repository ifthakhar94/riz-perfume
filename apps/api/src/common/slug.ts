/** Convert a string into a URL-safe slug (e.g. "Oud Royale 50ml" → "oud-royale-50ml"). */
export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
