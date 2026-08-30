"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { updateSettings, type SettingsValues } from "./actions";
import { resetTabNumbering } from "@/app/actions/tabs";

export function SettingsClient({
  initial,
  openTabCount,
}: {
  initial: SettingsValues;
  openTabCount: number;
}) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const router = useRouter();
  const [usageThreshold, setUsageThreshold] = useState(String(initial.usage_threshold_bytes));
  const [lowStock, setLowStock] = useState(String(initial.low_stock_threshold));
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);

  const canReset = openTabCount === 0;

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

  async function runReset() {
    setResetting(true);
    try {
      await resetTabNumbering();
      toast.success(t("tabResetDone"));
      setResetOpen(false);
      setConfirmText("");
      router.refresh();
    } catch {
      toast.error(tc("error"));
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">{t("title")}</h1>
      <Card className="max-w-md fade-in-up border-primary/10">
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
            <Button type="submit" disabled={saving} className="w-fit">
              {tc("save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-md fade-in-up border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">{t("tabNumbering")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {canReset ? t("tabResetHint") : t("tabResetBlocked")}
          </p>
          <Button
            variant="destructive"
            className="w-fit"
            disabled={!canReset}
            onClick={() => setResetOpen(true)}
          >
            <RotateCcw className="h-4 w-4" />
            {t("tabResetButton")}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("tabResetButton")}</DialogTitle>
            <DialogDescription>{t("tabResetWarning")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label>{t("tabResetTypeConfirm")}</Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESET"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== "RESET" || resetting}
              onClick={runReset}
            >
              {t("tabResetButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
