import { NextRequest, NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/session";
import { getServiceClient } from "@/lib/supabase/server";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((h) => escape(row[h])).join(","));
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const format = req.nextUrl.searchParams.get("format") ?? "json";
  const supabase = getServiceClient();

  const [products, tabs, tabItems, payments, quickSales, quickSaleItems] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("tabs").select("*"),
    supabase.from("tab_items").select("*"),
    supabase.from("payments").select("*"),
    supabase.from("quick_sales").select("*"),
    supabase.from("quick_sale_items").select("*"),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    products: products.data ?? [],
    tabs: tabs.data ?? [],
    tab_items: tabItems.data ?? [],
    payments: payments.data ?? [],
    quick_sales: quickSales.data ?? [],
    quick_sale_items: quickSaleItems.data ?? [],
  };

  if (format === "csv") {
    const csv = toCsv((tabs.data as Record<string, unknown>[]) ?? []);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="stmark-tabs-${Date.now()}.csv"`,
      },
    });
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="stmark-backup-${Date.now()}.json"`,
    },
  });
}
