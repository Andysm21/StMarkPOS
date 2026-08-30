export const PRODUCT_CATEGORIES = [
  "chips",
  "chocolate",
  "cold_drinks",
  "hot_drinks",
  "molto",
  "snacks",
  "biscuits",
  "other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Maps a product's raw category value to a known bucket, falling back to
 * "other" for legacy/free-text values that predate the fixed category list. */
export function resolveCategory(raw: string | null | undefined): ProductCategory {
  if (raw && (PRODUCT_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as ProductCategory;
  }
  return "other";
}
