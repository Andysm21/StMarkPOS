"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AdminNav() {
  const t = useTranslations("admin.nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin/products", label: t("products") },
    { href: "/admin/analytics", label: t("analytics") },
    { href: "/admin/settings", label: t("settings") },
    { href: "/admin/backup", label: t("backup") },
  ];

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-2">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            pathname?.startsWith(l.href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary"
          )}
        >
          {l.label}
        </Link>
      ))}
      <div className="grow" />
      <Button variant="ghost" size="sm" onClick={logout}>
        {tc("logout")}
      </Button>
    </nav>
  );
}
