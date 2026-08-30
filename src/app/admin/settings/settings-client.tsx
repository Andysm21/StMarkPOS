"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSettings, type SettingsValues } from "./actions";

export function SettingsClient({ initial }: { initial: SettingsValues }) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const [usageThreshold, setUsageThreshold] = useState(String(initial.usage_threshold_bytes));
  const [lowStock, setLowStock] = useState(String(initial.low_stock_threshold));
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        usage_threshold_bytes: Number(usageThreshold) || 0,
        low_stock_threshold: Number(lowStock) || 0,
      });
      toast.success(t("saved"));
    } catch {
      toast.error(tc("error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">{t("title")}</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t("usageThreshold")}</Label>
              <Input
                type="number"
                min="0"
                value={usageThreshold}
                onChange={(e) => setUsageThreshold(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("lowStockThreshold")}</Label>
              <Input
                type="number"
                min="0"
                value={lowStock}
                onChange={(e) => setLowStock(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {tc("save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
