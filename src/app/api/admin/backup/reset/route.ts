import { NextRequest, NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/session";
import { getServiceClient } from "@/lib/supabase/server";

// Truncates ONLY transactional tables (tabs, tab_items, payments,
// quick_sales, quick_sale_items) and resets the usage counter. Products are
// intentionally preserved. Irreversible — the client must have already
// gotten explicit typed "RESET" confirmation before calling this.
export async function POST(req: NextRequest) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { confirm } = await req.json().catch(() => ({ confirm: "" }));
  if (confirm !== "RESET") {
    return NextResponse.json({ error: "confirmation text mismatch" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const deletes = await Promise.all([
    supabase.from("tab_items").delete().not("id", "is", null),
    supabase.from("payments").delete().not("id", "is", null),
    supabase.from("quick_sale_items").delete().not("id", "is", null),
    supabase.from("quick_sales").delete().not("id", "is", null),
    supabase.from("tabs").delete().not("id", "is", null),
  ]);

  const failed = deletes.find((d) => d.error);
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  await supabase
    .from("usage_counter")
    .update({ estimated_bytes_used: 0, last_reset_at: new Date().toISOString() })
    .eq("id", 1);

  return NextResponse.json({ ok: true });
}
