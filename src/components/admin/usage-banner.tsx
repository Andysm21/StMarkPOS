import { getTranslations } from "next-intl/server";
import { getUsageStatus } from "@/lib/usage";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export async function UsageBanner() {
  const t = await getTranslations("backup");
  const status = await getUsageStatus().catch(() => null);
  if (!status || !status.overThreshold) return null;

  const usedMb = (status.usedBytes / 1_000_000).toFixed(1);
  const thresholdMb = (status.thresholdBytes / 1_000_000).toFixed(1);

  return (
    <div className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          {t("usageWarning")} ({t("usedEstimate")}: {usedMb}MB / {thresholdMb}MB)
        </span>
        <Link href="/admin/backup" className="underline font-medium">
          {t("title")}
        </Link>
      </div>
    </div>
  );
}
