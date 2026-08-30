"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AlertTriangle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

type UsageStatus = {
  usedBytes: number;
  thresholdBytes: number;
  overThreshold: boolean;
  lastResetAt: string | null;
};

export function BackupClient({ usage }: { usage: UsageStatus }) {
  const t = useTranslations("backup");
  const tc = useTranslations("common");
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);

  const usedMb = (usage.usedBytes / 1_000_000).toFixed(1);
  const thresholdMb = (usage.thresholdBytes / 1_000_000).toFixed(1);

  async function runReset() {
    setResetting(true);
    try {
      const res = await fetch("/api/admin/backup/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText }),
      });
      if (!res.ok) throw new Error("reset failed");
      toast.success(t("resetDone"));
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

      {usage.overThreshold && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t("usageWarning")}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("usedEstimate")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {usedMb}MB <span className="text-sm font-normal text-muted-foreground">/ {thresholdMb}MB</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("usageWarning")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("exportJson")} / {t("exportCsv")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <a href="/api/admin/backup/export?format=json" className={buttonVariants({ variant: "outline" })}>
            <Download className="h-4 w-4" />
            {t("exportJson")}
          </a>
          <a href="/api/admin/backup/export?format=csv" className={buttonVariants({ variant: "outline" })}>
            <Download className="h-4 w-4" />
            {t("exportCsv")}
          </a>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">{t("resetTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{t("resetWarning")}</p>
          <p className="text-sm font-medium">{t("exportFirst")}</p>
          <Button variant="destructive" className="w-fit" onClick={() => setResetOpen(true)}>
            {t("resetButton")}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("resetTitle")}</DialogTitle>
            <DialogDescription>{t("resetWarning")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label>{t("resetTypeConfirm")}</Label>
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
              {t("resetButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
