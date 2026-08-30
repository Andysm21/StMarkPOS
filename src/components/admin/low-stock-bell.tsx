"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Bell, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";

const SESSION_FLAG = "stmark_low_stock_notified";

export function LowStockBell({ products }: { products: Product[] }) {
  const t = useTranslations("lowStock");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (products.length === 0) return;
    try {
      if (sessionStorage.getItem(SESSION_FLAG)) return;
      sessionStorage.setItem(SESSION_FLAG, "1");
    } catch {
      // ignore storage errors, still show the toast this load
    }
    toast.warning(t("message", { count: products.length }), {
      action: {
        label: t("viewProducts"),
        onClick: () => setOpen(true),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  if (products.length === 0) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative shrink-0"
        onClick={() => setOpen(true)}
        aria-label={t("title")}
      >
        <Bell className="h-4 w-4" />
        <Badge
          variant="destructive"
          className="absolute -end-1 -top-1 h-4 min-w-4 rounded-full bg-destructive px-1 text-[10px] leading-none text-white"
        >
          {products.length}
        </Badge>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <PackageX className="h-4 w-4 shrink-0 text-destructive" />
                  <span dir="rtl" className="text-sm font-medium">
                    {locale === "ar" ? p.name_ar : p.name_en || p.name_ar}
                  </span>
                </div>
                <span className="text-sm font-semibold text-destructive">
                  {p.quantity_on_hand}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
