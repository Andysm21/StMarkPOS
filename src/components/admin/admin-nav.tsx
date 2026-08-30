"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Package, BarChart3, Settings, DatabaseBackup, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AdminNav() {
  const t = useTranslations("admin.nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin/products", label: t("products"), icon: Package },
    { href: "/admin/analytics", label: t("analytics"), icon: BarChart3 },
    { href: "/admin/settings", label: t("settings"), icon: Settings },
    { href: "/admin/backup", label: t("backup"), icon: DatabaseBackup },
  ];

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="mx-auto flex max-w-5xl items-center gap-1.5 overflow-x-auto px-4 py-2.5">
      {links.map((l) => {
        const Icon = l.icon;
        const active = pathname?.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "press flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {l.label}
          </Link>
        );
      })}
      <div className="grow" />
      <Button variant="ghost" size="sm" onClick={logout} className="shrink-0 gap-1.5">
        <LogOut className="h-4 w-4" />
        {tc("logout")}
      </Button>
    </nav>
  );
}
