"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-secondary to-background p-4">
        <form
          onSubmit={submit}
          className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center shadow-sm"
        >
          <span className="text-4xl">🔒</span>
          <h1 className="text-lg font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          <Input
            autoFocus
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="text-center text-2xl tracking-[0.6em]"
            placeholder="••••"
          />
          {error && <p className="text-sm text-destructive">{t("wrong")}</p>}
          <Button
            type="submit"
            size="lg"
            className="w-full"
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
