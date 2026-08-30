"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import type { Tab, TabItem, Payment, Product } from "@/lib/types";
import { addPayment, addTabItem, closeTab, removeTabItem } from "@/app/actions/tabs";

export function TabDetail({
  tab,
  initialItems,
  initialPayments,
  products,
}: {
  tab: Tab;
  initialItems: TabItem[];
  initialPayments: Payment[];
  products: Product[];
}) {
  const t = useTranslations("tab");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [items, setItems] = useState(initialItems);
  const [payments, setPayments] = useState(initialPayments);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const totalCharged = items.reduce((s, i) => s + i.price_snapshot * i.qty, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = totalCharged - totalPaid;
  const closed = tab.status === "closed";

  async function handleAddItem(product: Product) {
    setBusy(true);
    try {
      await addTabItem(tab.id, product, 1);
      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          tab_id: tab.id,
          product_id: product.id,
          name_snapshot: product.name_ar,
          price_snapshot: product.price,
          qty: 1,
          created_at: new Date().toISOString(),
        },
      ]);
      toast.success(t("itemAdded"));
    } catch {
      toast.error(tc("error"));
    } finally {
      setBusy(false);
      setPickerOpen(false);
    }
  }

  async function handleRemoveItem(item: TabItem) {
    setBusy(true);
    try {
      await removeTabItem(tab.id, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      toast.error(tc("error"));
    } finally {
      setBusy(false);
    }
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) return;
    setBusy(true);
    try {
      await addPayment(tab.id, amount);
      setPayments((prev) => [
        ...prev,
        { id: crypto.randomUUID(), tab_id: tab.id, amount, created_at: new Date().toISOString() },
      ]);
      toast.success(t("paymentAdded"));
      setPaymentAmount("");
      setPaymentOpen(false);
    } catch {
      toast.error(tc("error"));
    } finally {
      setBusy(false);
    }
  }

  async function handleClose() {
    if (balance !== 0) {
      const msg = t("confirmCloseWithBalance", { amount: formatCurrency(balance, locale) });
      if (!confirm(msg)) return;
    } else if (!confirm(t("confirmCloseTitle"))) {
      return;
    }
    setBusy(true);
    try {
      await closeTab(tab.id);
      toast.success(t("tabClosed"));
      router.push("/");
      router.refresh();
    } catch {
      toast.error(tc("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <p className="text-lg font-bold" dir="rtl">
            {tab.customer_name_ar}
          </p>
          <p className="text-xs text-muted-foreground">
            #{tab.tab_number} ·{" "}
            <Badge variant={closed ? "secondary" : "default"}>
              {closed ? t("closed") : t("open")}
            </Badge>
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-3 gap-2 py-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">{t("total")}</p>
            <p className="font-bold">{formatCurrency(totalCharged, locale)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("paid")}</p>
            <p className="font-bold">{formatCurrency(totalPaid, locale)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("balance")}</p>
            <p className="font-bold text-primary">{formatCurrency(balance, locale)}</p>
          </div>
        </CardContent>
      </Card>

      {!closed && (
        <div className="flex gap-2">
          <Button className="h-11 flex-1" onClick={() => setPickerOpen(true)} disabled={busy}>
            <Plus className="h-4 w-4" />
            {t("addItem")}
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1"
            onClick={() => setPaymentOpen(true)}
            disabled={busy}
          >
            {t("addPayment")}
          </Button>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{t("items")}</h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noItems")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p dir="rtl" className="font-medium">
                      {item.name_snapshot}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("qty")}: {item.qty} × {formatCurrency(item.price_snapshot, locale)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {formatCurrency(item.price_snapshot * item.qty, locale)}
                    </span>
                    {!closed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item)}
                        disabled={busy}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {!closed && (
        <Button variant="destructive" size="lg" onClick={handleClose} disabled={busy}>
          {t("closeTab")}
        </Button>
      )}

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("pickProduct")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {products.map((p) => (
              <button
                key={p.id}
                disabled={busy}
                onClick={() => handleAddItem(p)}
                className="flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-colors hover:bg-secondary active:scale-95 disabled:opacity-50"
              >
                <span dir="rtl" className="text-sm font-medium">
                  {p.name_ar}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(p.price, locale)}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addPayment")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="flex flex-col gap-4">
            <Input
              type="number"
              min="0.01"
              step="0.01"
              autoFocus
              className="h-12 text-lg"
              placeholder={t("paymentAmount")}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button type="submit" disabled={busy}>
                {tc("confirm")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
