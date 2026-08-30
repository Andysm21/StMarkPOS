import "server-only";
import { getServiceClient } from "@/lib/supabase/server";
import { subDays, format } from "date-fns";

export type AnalyticsData = {
  dailyRevenue: { date: string; tabs: number; quick: number }[];
  topByRevenue: { name: string; value: number }[];
  topByQty: { name: string; value: number }[];
  openLiability: number;
  salesBreakdown: { name: string; value: number }[];
};

export async function getAnalytics(): Promise<AnalyticsData> {
  const supabase = getServiceClient();
  const since = subDays(new Date(), 14).toISOString();

  const [
    { data: payments },
    { data: quickSales },
    { data: tabItems },
    { data: quickSaleItems },
    { data: openTabs },
  ] = await Promise.all([
    supabase.from("payments").select("amount, created_at").gte("created_at", since),
    supabase.from("quick_sales").select("total, created_at").gte("created_at", since),
    supabase
      .from("tab_items")
      .select("name_snapshot, price_snapshot, qty, created_at")
      .gte("created_at", since),
    supabase
      .from("quick_sale_items")
      .select("name_snapshot, price_snapshot, qty"),
    supabase.from("tabs").select("total_charged, total_paid").eq("status", "open"),
  ]);

  const days: string[] = [];
  for (let i = 13; i >= 0; i--) days.push(format(subDays(new Date(), i), "yyyy-MM-dd"));

  const tabsByDay = new Map<string, number>();
  for (const p of (payments as { amount: number; created_at: string }[]) ?? []) {
    const day = p.created_at.slice(0, 10);
    tabsByDay.set(day, (tabsByDay.get(day) ?? 0) + p.amount);
  }
  const quickByDay = new Map<string, number>();
  for (const q of (quickSales as { total: number; created_at: string }[]) ?? []) {
    const day = q.created_at.slice(0, 10);
    quickByDay.set(day, (quickByDay.get(day) ?? 0) + q.total);
  }
  const dailyRevenue = days.map((date) => ({
    date,
    tabs: Math.round((tabsByDay.get(date) ?? 0) * 100) / 100,
    quick: Math.round((quickByDay.get(date) ?? 0) * 100) / 100,
  }));

  type ItemRow = { name_snapshot: string; price_snapshot: number; qty: number };
  const allItems: ItemRow[] = [
    ...(((tabItems as ItemRow[]) ?? [])),
    ...(((quickSaleItems as ItemRow[]) ?? [])),
  ];
  const revenueByName = new Map<string, number>();
  const qtyByName = new Map<string, number>();
  for (const item of allItems) {
    revenueByName.set(
      item.name_snapshot,
      (revenueByName.get(item.name_snapshot) ?? 0) + item.price_snapshot * item.qty
    );
    qtyByName.set(item.name_snapshot, (qtyByName.get(item.name_snapshot) ?? 0) + item.qty);
  }
  const topByRevenue = [...revenueByName.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const topByQty = [...qtyByName.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const openLiability = ((openTabs as { total_charged: number; total_paid: number }[]) ?? []).reduce(
    (sum, t) => sum + (t.total_charged - t.total_paid),
    0
  );

  const tabsRevenueTotal = dailyRevenue.reduce((s, d) => s + d.tabs, 0);
  const quickRevenueTotal = dailyRevenue.reduce((s, d) => s + d.quick, 0);

  return {
    dailyRevenue,
    topByRevenue,
    topByQty,
    openLiability: Math.round(openLiability * 100) / 100,
    salesBreakdown: [
      { name: "tabs", value: tabsRevenueTotal },
      { name: "quick", value: quickRevenueTotal },
    ],
  };
}
