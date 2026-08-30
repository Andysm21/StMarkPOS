"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ImageOff, PackageSearch } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";
import { createProduct, deleteProduct, updateProduct, type ProductInput } from "./actions";
import { ProductForm } from "./product-form";

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [products, setProducts] = useState(initialProducts);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setFormOpen(true);
  }

  async function handleSubmit(input: ProductInput) {
    if (editing) {
      await updateProduct(editing.id, input);
      setProducts((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, ...input } : p))
      );
    } else {
      await createProduct(input);
      setProducts((prev) => [
        {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...input,
        },
        ...prev,
      ]);
    }
    toast.success(t("saved"));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast.success(t("deleted"));
      setDeleteTarget(null);
    } catch {
      toast.error(tc("error"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <Button onClick={openCreate} className="glow-primary">
          <Plus className="h-4 w-4" />
          {t("addProduct")}
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={PackageSearch} title={t("noProducts")} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Card
              key={p.id}
              className="lift stagger-item overflow-hidden border-primary/10"
              style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
            >
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-muted to-secondary">
                {p.image_url ? (
                  <Image
                    src={p.image_url}
                    alt={p.name_ar}
                    width={200}
                    height={128}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <ImageOff className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <CardContent className="flex flex-col gap-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold" dir="rtl">
                      {p.name_ar}
                    </p>
                    {p.name_en && (
                      <p className="text-sm text-muted-foreground">{p.name_en}</p>
                    )}
                  </div>
                  <Badge variant={p.active ? "success" : "secondary"}>
                    {p.active ? tc("active") : tc("inactive")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-primary">{formatCurrency(p.price, locale)}</span>
                  <span className="text-muted-foreground">
                    {t("quantity")}: {p.quantity_on_hand}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" />
                    {tc("edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget(p)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        onSubmit={handleSubmit}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDeleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("confirmDelete")}</p>
          {deleteTarget && (
            <p dir="rtl" className="font-semibold">
              {deleteTarget.name_ar}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
