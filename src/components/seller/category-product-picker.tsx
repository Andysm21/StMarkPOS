"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ImageOff, Search, ArrowLeft, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/format";
import { PRODUCT_CATEGORIES, resolveCategory } from "@/lib/categories";
import type { Product } from "@/lib/types";

const CATEGORY_EMOJI: Record<string, string> = {
  chips: "🍟",
  chocolate: "🍫",
  cold_drinks: "🥤",
  hot_drinks: "☕",
  molto: "🧃",
  snacks: "🍪",
  biscuits: "🍘",
  other: "🧺",
};

export function CategoryProductPicker({
  products,
  onSelect,
  disabled,
}: {
  products: Product[];
  onSelect: (product: Product) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("picker");
  const tCat = useTranslations("categories");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categoriesWithProducts = useMemo(() => {
    const set = new Set(products.map((p) => resolveCategory(p.category)));
    return PRODUCT_CATEGORIES.filter((c) => set.has(c));
  }, [products]);

  const searching = query.trim().length > 0;

  const visibleProducts = useMemo(() => {
    if (searching) {
      const q = query.trim().toLowerCase();
      return products.filter(
        (p) =>
          p.name_ar.toLowerCase().includes(q) ||
          (p.name_en && p.name_en.toLowerCase().includes(q))
      );
    }
    if (category) {
      return products.filter((p) => resolveCategory(p.category) === category);
    }
    return [];
  }, [products, query, category, searching]);

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="ps-9"
        />
      </div>

      {!searching && !category && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {categoriesWithProducts.map((c, i) => (
            <button
              key={c}
              type="button"
              disabled={disabled}
              onClick={() => setCategory(c)}
              style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
              className="lift stagger-item flex flex-col items-center gap-1.5 rounded-xl border border-primary/10 bg-gradient-to-br from-secondary to-muted p-3 text-center disabled:opacity-50"
            >
              <span className="text-2xl">{CATEGORY_EMOJI[c] ?? "🧺"}</span>
              <span className="text-xs font-medium">{tCat(c)}</span>
            </button>
          ))}
          {categoriesWithProducts.length === 0 && (
            <div className="col-span-full">
              <EmptyState icon={ImageOff} title={t("noResults")} className="py-6" />
            </div>
          )}
        </div>
      )}

      {!searching && category && (
        <button
          type="button"
          onClick={() => setCategory(null)}
          className="press flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <BackIcon className="h-4 w-4" />
          {t("backToCategories")}
        </button>
      )}

      {(searching || category) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visibleProducts.map((p, i) => (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(p)}
              style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
              className="lift stagger-item flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border border-primary/10 bg-card text-center disabled:opacity-50"
            >
              <div className="flex h-20 w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image_url}
                    alt={p.name_ar}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageOff className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-0.5 px-2 pb-2">
                <span dir="rtl" className="text-sm font-medium">
                  {p.name_ar}
                </span>
                <span className="text-xs font-semibold text-primary">
                  {formatCurrency(p.price, locale)}
                </span>
              </div>
            </button>
          ))}
          {visibleProducts.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={ImageOff}
                title={searching ? t("noResults") : t("noProductsInCategory")}
                className="py-6"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
