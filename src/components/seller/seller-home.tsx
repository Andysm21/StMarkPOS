"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, ShoppingCart, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Tab } from "@/lib/types";
import { createTab } from "@/app/actions/tabs";

export function SellerHome({ initialTabs }: { initialTabs: Tab[] }) {
  const t = useTranslations("seller");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [tabs, setTabs] = useState(initialTabs);
  const [query, setQuery] = useState("");
  const [newTabOpen, setNewTabOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return tabs;
    return tabs.filter(
      (tab) =>
        tab.customer_name_ar.includes(q) || String(tab.tab_number).includes(q)
    );
  }, [tabs, query]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const tab = await createTab(name.trim());
      setTabs((prev) => [...prev, tab]);
      setName("");
      setNewTabOpen(false);
    } catch {
      toast.error(tc("error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">{t("openTabs")}</h1>
        <div className="flex gap-2">
          <Link href="/quick-checkout" className={buttonVariants({ variant: "outline" })}>
            <ShoppingCart className="h-4 w-4" />
            {t("quickCheckout")}
          </Link>
          <Button onClick={() => setNewTabOpen(true)} size="lg" className="h-11">
            <Plus className="h-4 w-4" />
            {t("newTab")}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="ps-9 h-11"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Receipt className="h-8 w-8" />
            <p>{t("noTabs")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tab) => {
            const balance = tab.total_charged - tab.total_paid;
            return (
              <Link key={tab.id} href={`/tabs/${tab.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md active:scale-[0.99]">
                  <CardContent className="flex flex-col gap-2 py-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
                        {t("tabNumber")} {tab.tab_number}
                      </span>
                    </div>
                    <p className="truncate text-lg font-semibold" dir="rtl">
                      {tab.customer_name_ar}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("balance")}</span>
                      <span
                        className={
                          balance > 0 ? "font-bold text-primary" : "font-bold text-muted-foreground"
                        }
                      >
                        {formatCurrency(balance, locale)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog open={newTabOpen} onOpenChange={setNewTabOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("newTab")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              autoFocus
              dir="rtl"
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 text-lg"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewTabOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button type="submit" disabled={saving || !name.trim()}>
                {t("createTab")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
