import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client. SERVER-ONLY. Never import this from a
// client component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
// RLS is deny-all on every table; this key bypasses RLS entirely, which is
// why it must never leave the server.

// We don't generate Supabase types from the schema, so the client is typed
// loosely (any) here; call sites use src/lib/types.ts for shape safety.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: ReturnType<typeof createClient<any, any, any>> | null = null;

export function getServiceClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = createClient<any, any, any>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
