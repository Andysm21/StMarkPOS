"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { resizeImageToWebp } from "@/lib/image-resize";
import type { Product } from "@/lib/types";
import type { ProductInput } from "./actions";

export function ProductForm({
  open,
  onOpenChange,
  product,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSubmit: (input: ProductInput) => Promise<void>;
}) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const [nameAr, setNameAr] = useState(product?.name_ar ?? "");
  const [nameEn, setNameEn] = useState(product?.name_en ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [qty, setQty] = useState(String(product?.quantity_on_hand ?? "0"));
  const [category, setCategory] = useState(product?.category ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [imageUrl, setImageUrl] = useState<string | null>(product?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const webp = await resizeImageToWebp(file);
      const form = new FormData();
      form.append("file", webp, "image.webp");
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("upload failed");
      const data = await res.json();
      setImageUrl(data.url);
    } catch {
      toast.error(tc("error"));
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        name_ar: nameAr,
        name_en: nameEn,
        price: Number(price) || 0,
        quantity_on_hand: Number(qty) || 0,
        category,
        active,
        image_url: imageUrl,
      });
      onOpenChange(false);
    } catch {
      toast.error(tc("error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? t("editProduct") : t("addProduct")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t("nameAr")}</Label>
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} required dir="rtl" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("nameEn")}</Label>
            <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>{t("price")}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("quantity")}</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("category")}</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("image")}</Label>
            <div className="flex items-center gap-3">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-lg object-cover"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
            {uploading && <p className="text-xs text-muted-foreground">{tc("loading")}</p>}
          </div>
          <div className="flex items-center justify-between">
            <Label>{t("active")}</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {tc("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
