"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Minus, Plus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";
import { submitQuickSale, type CartLine } from "@/app/actions/quick-sale";

export function QuickCheckoutClient({ products }: { products: Product[] }) {
  const t = useTranslations("quickCheckout");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ lines: CartLine[]; total: number } | null>(null);

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

  function changeQty(productId: string, delta: number) {
    setCart((prev) => {
      const next = Math.max(0, (prev[productId] ?? 0) + delta);
      return { ...prev, [productId]: next };
    });
  }

  async function confirmSale() {
    if (lines.length === 0) return;
    setSubmitting(true);
    try {
      await submitQuickSale(lines);
      setReceipt({ lines, total });
      setCart({});
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">{t("title")}</h1>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => {
          const qty = cart[p.id] ?? 0;
          return (
            <Card
              key={p.id}
              className={cn(
                "lift stagger-item border-primary/10",
                qty > 0 && "ring-2 ring-primary/40"
              )}
              style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
            >
              <CardContent className="flex flex-col items-center gap-2 py-4 text-center">
                <span dir="rtl" className="text-sm font-medium">
                  {p.name_ar}
                </span>
                <span className="text-xs font-semibold text-primary">
                  {formatCurrency(p.price, locale)}
                </span>
                {qty === 0 ? (
                  <Button size="sm" className="press" onClick={() => changeQty(p.id, 1)}>
                    {t("addToCart")}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="press" onClick={() => changeQty(p.id, -1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-6 text-center font-semibold">{qty}</span>
                    <Button size="icon" variant="outline" className="press" onClick={() => changeQty(p.id, 1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="sticky bottom-0 -mx-4 border-t border-primary/10 bg-card/95 px-4 py-3 shadow-[0_-8px_20px_-8px_rgba(0,0,0,0.15)] backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{t("total")}</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(total, locale)}</p>
          </div>
          <Button size="lg" className="h-12 flex-1 glow-primary" disabled={lines.length === 0 || submitting} onClick={confirmSale}>
            {t("confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
