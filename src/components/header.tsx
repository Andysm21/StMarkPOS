import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";

export async function Header({
  mode,
  right,
}: {
  mode: "seller" | "admin";
  right?: React.ReactNode;
}) {
  const t = await getTranslations();
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg">
            🧺
          </span>
          <div>
            <p className="text-sm font-bold leading-tight">{t("app.title")}</p>
            <p className="text-xs font-medium leading-tight text-muted-foreground">
              {mode === "seller" ? t("header.seller") : t("header.admin")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {right}
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
