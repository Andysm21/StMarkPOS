"use client";

import { useRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud, X, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { resizeImageToWebp } from "@/lib/image-resize";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
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
  const tCat = useTranslations("categories");
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
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error(tc("error"));
      return;
    }
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
            <Select value={category || undefined} onValueChange={(v) => setCategory(String(v))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {tCat(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("image")}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            {imageUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-primary/10 bg-secondary/30 p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={imageUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-fit"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    {t("replaceImage")}
                  </Button>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="shrink-0 text-destructive"
                  onClick={() => setImageUrl(null)}
                  disabled={uploading}
                  aria-label={t("removeImage")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
                disabled={uploading}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-primary/25 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/30",
                  uploading && "opacity-60"
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">
                  {uploading ? tc("loading") : t("uploadHint")}
                </span>
                {!uploading && (
                  <span className="text-xs text-muted-foreground">{t("uploadHintDrag")}</span>
                )}
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/10 bg-secondary/20 p-3">
            <div className="flex flex-col gap-0.5">
              <Label>{t("active")}</Label>
              <span className="text-xs text-muted-foreground">{t("activeHint")}</span>
            </div>
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
