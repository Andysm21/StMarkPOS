"use server";

import { getServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SettingsValues = {
  usage_threshold_bytes: number;
  low_stock_threshold: number;
};

export async function getSettings(): Promise<SettingsValues> {
  const supabase = getServiceClient();
  const { data } = await supabase.from("settings").select("*");
  const rows = (data as { key: string; value: string }[] | null) ?? [];
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    usage_threshold_bytes: Number(map.usage_threshold_bytes ?? 2_000_000_000),
    low_stock_threshold: Number(map.low_stock_threshold ?? 5),
  };
}

export async function updateSettings(values: SettingsValues) {
  const supabase = getServiceClient();
  const { error } = await supabase.from("settings").upsert([
    { key: "usage_threshold_bytes", value: String(values.usage_threshold_bytes) },
    { key: "low_stock_threshold", value: String(values.low_stock_threshold) },
  ]);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
}
