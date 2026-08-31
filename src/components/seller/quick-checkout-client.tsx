"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  CheckCircle2,
  ImageOff,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";
import { submitQuickSale, type CartLine } from "@/app/actions/quick-sale";
import { CategoryProductPicker } from "@/components/seller/category-product-picker";

export function QuickCheckoutClient({ products }: { products: Product[] }) {
  const t = useTranslations("quickCheckout");
  const tc = useTranslations("common");
  const tTab = useTranslations("tab");
  const locale = useLocale();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ lines: CartLine[]; total: number } | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [pickedProduct, setPickedProduct] = useState<Product | null>(null);
  const [pickQty, setPickQty] = useState(1);

  const lines: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([productId, qty]) => {
          const product = products.find((p) => p.id === productId)!;
          return {
            product_id: productId,
            name_snapshot: product.name_ar,
            price_snapshot: product.price,
            qty,
          };
        }),
    [cart, products]
  );

  const total = lines.reduce((s, l) => s + l.price_snapshot * l.qty, 0);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);

  function changeQty(productId: string, delta: number) {
    setCart((prev) => {
      const next = Math.max(0, (prev[productId] ?? 0) + delta);
      return { ...prev, [productId]: next };
    });
  }

  function addFromPicker(product: Product) {
    setPickedProduct(product);
    setPickQty(1);
  }

  function confirmPick() {
    if (!pickedProduct) return;
    changeQty(pickedProduct.id, pickQty);
    setPickedProduct(null);
    toast.success(tTab("itemAdded"));
  }

  async function confirmSale() {
    if (lines.length === 0) return;
    setSubmitting(true);
    try {
      await submitQuickSale(lines);
      setReceipt({ lines, total });
      setCart({});
      setCartOpen(false);
      toast.success(t("success"));
    } catch {
      toast.error(tc("error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (receipt) {
    return (
      <div className="fade-in-up flex flex-col items-center gap-4 py-8 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success glow-success">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <h1 className="text-xl font-bold">{t("success")}</h1>
        <Card className="w-full max-w-sm border-primary/10">
          <CardContent className="flex flex-col gap-2 py-4">
            <p className="text-sm font-semibold text-muted-foreground">{t("receipt")}</p>
            {receipt.lines.map((l) => (
              <div key={l.product_id} className="flex justify-between text-sm">
                <span dir="rtl">
                  {l.name_snapshot} × {l.qty}
                </span>
                <span>{formatCurrency(l.price_snapshot * l.qty, locale)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t pt-2 font-bold text-primary">
              <span>{t("total")}</span>
              <span>{formatCurrency(receipt.total, locale)}</span>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button onClick={() => setReceipt(null)} size="lg">
            {t("newSale")}
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
            {tc("back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center gap-2">
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Link>
        <h1 className="text-xl font-bold">{t("title")}</h1>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={ShoppingCart} title={t("emptyCart")} />
      ) : pickedProduct ? (
        <Card className="border-primary/10">
          <CardContent className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl bg-secondary">
              {pickedProduct.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pickedProduct.image_url}
                  alt={pickedProduct.name_ar}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageOff className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <p dir="rtl" className="text-base font-semibold">
              {pickedProduct.name_ar}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(pickedProduct.price, locale)} {tTab("each")}
            </p>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => setPickQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-xl font-bold">{pickQty}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => setPickQty((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm font-semibold text-primary">
              {formatCurrency(pickedProduct.price * pickQty, locale)}
            </p>
            <div className="flex w-full gap-2">
              <Button
                type="button"
                variant="outline"
                className="press flex-1"
                onClick={() => setPickedProduct(null)}
              >
                {locale === "ar" ? (
                  <ArrowRight className="h-4 w-4" />
                ) : (
                  <ArrowLeft className="h-4 w-4" />
                )}
                {tc("back")}
              </Button>
              <Button className="flex-1" onClick={confirmPick}>
                {t("addToCart")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CategoryProductPicker products={products} onSelect={addFromPicker} disabled={submitting} />
      )}

      {/* Sticky glanceable cart bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/10 bg-card/95 px-4 py-3 shadow-[0_-8px_20px_-8px_rgba(0,0,0,0.15)] backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            disabled={itemCount === 0}
            className="press flex items-center gap-2 disabled:opacity-50"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </span>
            <div className="text-start">
              <p className="text-xs text-muted-foreground">{t("total")}</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(total, locale)}</p>
            </div>
          </button>
          <Button
            size="lg"
            className="h-12 flex-1 glow-primary"
            disabled={lines.length === 0 || submitting}
            onClick={confirmSale}
          >
            {t("confirm")}
          </Button>
        </div>
      </div>

      {/* Persistent cart summary sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="bottom" className="max-h-[75vh]">
          <SheetHeader>
            <SheetTitle>
              {t("cart")} ({itemCount} {t("items")})
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4">
            {lines.length === 0 ? (
              <EmptyState icon={ShoppingCart} title={t("emptyCart")} className="py-8" />
            ) : (
              lines.map((l) => (
                <div
                  key={l.product_id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-primary/10 bg-secondary/20 p-3"
                >
                  <div>
                    <p dir="rtl" className="text-sm font-medium">
                      {l.name_snapshot}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(l.price_snapshot, locale)} × {l.qty}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => changeQty(l.product_id, -1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-5 text-center font-semibold">{l.qty}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => changeQty(l.product_id, 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setCart((prev) => ({ ...prev, [l.product_id]: 0 }))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <SheetFooter>
            <div className="flex items-center justify-between border-t pt-3 font-bold text-primary">
              <span>{t("total")}</span>
              <span>{formatCurrency(total, locale)}</span>
            </div>
            <Button
              size="lg"
              className="glow-primary"
              disabled={lines.length === 0 || submitting}
              onClick={confirmSale}
            >
              {t("confirm")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  );
}
