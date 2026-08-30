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
