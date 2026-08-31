"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ImageOff,
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ShoppingBasket,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
import { CategoryProductPicker } from "@/components/seller/category-product-picker";

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
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pickQty, setPickQty] = useState(1);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  const totalCharged = items.reduce((s, i) => s + i.price_snapshot * i.qty, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = totalCharged - totalPaid;
  const closed = tab.status === "closed";

  const [flash, setFlash] = useState(false);
  const prevBalance = useRef(balance);
  useEffect(() => {
    if (prevBalance.current !== balance) {
      setFlash(true);
      prevBalance.current = balance;
      const timer = setTimeout(() => setFlash(false), 700);
      return () => clearTimeout(timer);
    }
  }, [balance]);

  function pickProduct(product: Product) {
    setSelectedProduct(product);
    setPickQty(1);
  }

  async function handleAddItem(product: Product, qty: number) {
    setBusy(true);
    try {
      await addTabItem(tab.id, product, qty);
      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          tab_id: tab.id,
          product_id: product.id,
          name_snapshot: product.name_ar,
          price_snapshot: product.price,
          qty,
          created_at: new Date().toISOString(),
        },
      ]);
      toast.success(t("itemAdded"));
    } catch {
      toast.error(tc("error"));
    } finally {
      setBusy(false);
      setSelectedProduct(null);
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
      setCloseConfirmOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "press")}>
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
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

      <Card className="fade-in-up overflow-hidden border-primary/10">
        <CardContent className="grid grid-cols-2 gap-3 py-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Wallet className="h-4 w-4" />
            </span>
            <p className="text-xs text-muted-foreground">{t("total")}</p>
            <p className="font-bold">{formatCurrency(totalCharged, locale)}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <p className="text-xs text-muted-foreground">{t("paid")}</p>
            <p className="font-bold">{formatCurrency(totalPaid, locale)}</p>
          </div>
        </CardContent>
        <CardContent
          className={cn(
            "flex flex-col items-center gap-1 border-t pt-4 pb-5 text-center transition-colors duration-300",
            flash && "flash-highlight",
            balance > 0 && "bg-destructive/5",
            balance < 0 && "bg-success/5"
          )}
        >
          {balance > 0 ? (
            <>
              <TrendingUp className="h-5 w-5 text-destructive" />
              <p className="text-xs font-medium text-destructive">{t("owedFromCustomer")}</p>
              <p className="text-3xl font-extrabold tracking-tight text-destructive">
                {formatCurrency(balance, locale)}
              </p>
            </>
          ) : balance < 0 ? (
            <>
              <TrendingDown className="h-5 w-5 text-success" />
              <p className="text-xs font-medium text-success">{t("changeDueToCustomer")}</p>
              <p className="text-3xl font-extrabold tracking-tight text-success">
                {formatCurrency(Math.abs(balance), locale)}
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">{t("settledInFull")}</p>
              <p className="text-3xl font-extrabold tracking-tight text-muted-foreground">
                {formatCurrency(0, locale)}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {!closed && (
        <Button
          variant="success"
          className="h-11 w-full"
          onClick={() => setPaymentOpen(true)}
          disabled={busy}
        >
          <Wallet className="h-4 w-4" />
          {t("addPayment")}
        </Button>
      )}

      {!closed && (
        <Card className="border-primary/10">
          <CardContent className="flex flex-col gap-3 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Plus className="h-4 w-4 text-primary" />
              {t("addItem")}
            </h2>
            {selectedProduct ? (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl bg-secondary shadow-sm">
                  {selectedProduct.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name_ar}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageOff className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <p dir="rtl" className="text-xl font-bold">
                  {selectedProduct.name_ar}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(selectedProduct.price, locale)} {t("each")}
                </p>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => setPickQty((q) => Math.max(1, q - 1))}
                    disabled={busy}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-xl font-bold">{pickQty}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => setPickQty((q) => q + 1)}
                    disabled={busy}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm font-semibold text-primary">
                  {formatCurrency(selectedProduct.price * pickQty, locale)}
                </p>
                <div className="flex w-full gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="press flex-1"
                    onClick={() => setSelectedProduct(null)}
                    disabled={busy}
                  >
                    {locale === "ar" ? (
                      <ArrowRight className="h-4 w-4" />
                    ) : (
                      <ArrowLeft className="h-4 w-4" />
                    )}
                    {tc("back")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleAddItem(selectedProduct, pickQty)}
                    disabled={busy}
                  >
                    {t("addItem")}
                  </Button>
                </div>
              </div>
            ) : (
              <CategoryProductPicker products={products} onSelect={pickProduct} disabled={busy} />
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{t("items")}</h2>
        {items.length === 0 ? (
          <EmptyState icon={ShoppingBasket} title={t("noItems")} className="py-8" />
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <Card
                key={item.id}
                className="stagger-item border-primary/10"
                style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
              >
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
                    <span className="font-semibold text-primary">
                      {formatCurrency(item.price_snapshot * item.qty, locale)}
                    </span>
                    {!closed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="press"
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
        <Button
          variant="destructive"
          size="lg"
          onClick={() => setCloseConfirmOpen(true)}
          disabled={busy}
        >
          {t("closeTab")}
        </Button>
      )}

      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmCloseTitle")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("closeSummaryTotal")}</span>
              <span className="font-medium">{formatCurrency(totalCharged, locale)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("closeSummaryPaid")}</span>
              <span className="font-medium">{formatCurrency(totalPaid, locale)}</span>
            </div>
            <div
              className={cn(
                "flex items-center justify-between rounded-xl border p-3",
                balance > 0 && "border-destructive/20 bg-destructive/5",
                balance < 0 && "border-success/20 bg-success/5"
              )}
            >
              {balance > 0 ? (
                <>
                  <span className="text-sm font-medium text-destructive">
                    {t("owedFromCustomer")}
                  </span>
                  <span className="text-lg font-bold text-destructive">
                    {formatCurrency(balance, locale)}
                  </span>
                </>
              ) : balance < 0 ? (
                <>
                  <span className="text-sm font-medium text-success">
                    {t("changeDueToCustomer")}
                  </span>
                  <span className="text-lg font-bold text-success">
                    {formatCurrency(Math.abs(balance), locale)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium text-muted-foreground">
                    {t("settledInFull")}
                  </span>
                  <span className="text-lg font-bold text-muted-foreground">
                    {formatCurrency(0, locale)}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{t("closeConfirmQuestion")}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseConfirmOpen(false)} disabled={busy}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleClose} disabled={busy}>
              {t("confirmCloseAction")}
            </Button>
          </DialogFooter>
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
