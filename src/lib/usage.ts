import "server-only";
import { getServiceClient } from "@/lib/supabase/server";

// App-side usage/egress ESTIMATE. This is not the real Supabase billing
// number — it's a rough counter we increment ourselves on reads we know
// carry bytes (list queries, served image bytes) so Admin can get an early
// warning before a real quota is hit.
export async function trackUsageBytes(bytes: number) {
  if (!bytes || bytes <= 0) return;
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("usage_counter")
      .select("estimated_bytes_used")
      .eq("id", 1)
      .single();
    const current = (data as { estimated_bytes_used: number } | null)?.estimated_bytes_used ?? 0;
    await supabase
      .from("usage_counter")
      .update({ estimated_bytes_used: current + bytes })
      .eq("id", 1);
  } catch {
    // Usage tracking must never break the actual request.
  }
}

export function estimateJsonBytes(payload: unknown) {
  try {
    return JSON.stringify(payload).length;
  } catch {
    return 0;
  }
}

export async function getUsageStatus() {
  const supabase = getServiceClient();
  const [{ data: usage }, { data: settingsRows }] = await Promise.all([
    supabase.from("usage_counter").select("*").eq("id", 1).single(),
    supabase.from("settings").select("*").eq("key", "usage_threshold_bytes"),
  ]);
  const thresholdRow = (settingsRows as { key: string; value: string }[] | null)?.[0];
  const threshold = thresholdRow ? Number(thresholdRow.value) : 2_000_000_000;
  const used = (usage as { estimated_bytes_used: number } | null)?.estimated_bytes_used ?? 0;
  return {
    usedBytes: used,
    thresholdBytes: threshold,
    overThreshold: used >= threshold,
    lastResetAt: (usage as { last_reset_at: string } | null)?.last_reset_at ?? null,
  };
}
