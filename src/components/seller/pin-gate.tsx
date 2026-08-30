"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SESSION_KEY = "stmark_seller_pin_ok";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

function markUnlocked() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // ignore storage failures (private mode etc.)
  }
  listeners.forEach((l) => l());
}

export function PinGate({ children }: { children: React.ReactNode }) {
  const t = useTranslations("pin");
  const unlocked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/seller/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    setLoading(false);
    if (!res.ok) {
      setError(true);
      setPin("");
      return;
    }
    markUnlocked();
  }

  if (!unlocked) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-background to-accent/40 p-4">
        <div className="pointer-events-none absolute -top-24 -start-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -end-24 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
        <form
          onSubmit={submit}
          className={cn(
            "fade-in-up relative flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl border border-primary/10 bg-card/95 p-7 text-center shadow-xl shadow-primary/10 backdrop-blur",
            error && "shake"
          )}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-primary-foreground shadow-lg shadow-primary/30">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="text-lg font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          <Input
            autoFocus
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="h-14 text-center text-2xl tracking-[0.6em]"
            placeholder="••••"
          />
          {error && <p className="text-sm font-medium text-destructive">{t("wrong")}</p>}
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full text-base"
            disabled={loading || pin.length !== 4}
          >
            {t("submit")}
          </Button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
