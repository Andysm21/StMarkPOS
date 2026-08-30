"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  async function toggle() {
    const next = locale === "ar" ? "en" : "ar";
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle}>
      {locale === "ar" ? "EN" : "AR"}
    </Button>
  );
}
