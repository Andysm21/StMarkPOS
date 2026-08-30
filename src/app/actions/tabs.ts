"use server";

import { getServiceClient } from "@/lib/supabase/server";
import { trackUsageBytes, estimateJsonBytes } from "@/lib/usage";
import { hasValidAdminSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { Tab, TabItem, Payment, Product } from "@/lib/types";

export async function listOpenTabs(): Promise<Tab[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("tabs")
    .select("*")
    .eq("status", "open")
    .order("tab_number", { ascending: true });
  if (error) throw new Error(error.message);
  await trackUsageBytes(estimateJsonBytes(data));
  return (data as Tab[]) ?? [];
}

export async function getTab(id: string): Promise<{
  tab: Tab;
  items: TabItem[];
  payments: Payment[];
}> {
  const supabase = getServiceClient();
  const [{ data: tab, error: e1 }, { data: items, error: e2 }, { data: payments, error: e3 }] =
    await Promise.all([
      supabase.from("tabs").select("*").eq("id", id).single(),
      supabase.from("tab_items").select("*").eq("tab_id", id).order("created_at"),
      supabase.from("payments").select("*").eq("tab_id", id).order("created_at"),
    ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  if (e3) throw new Error(e3.message);
  await trackUsageBytes(estimateJsonBytes({ tab, items, payments }));
  return { tab: tab as Tab, items: (items as TabItem[]) ?? [], payments: (payments as Payment[]) ?? [] };
}

export async function createTab(customerNameAr: string): Promise<Tab> {
  const supabase = getServiceClient();
  const { data: maxRow } = await supabase
    .from("tabs")
    .select("tab_number")
    .order("tab_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextNumber = ((maxRow as { tab_number: number } | null)?.tab_number ?? 0) + 1;

  const { data, error } = await supabase
    .from("tabs")
    .insert({ customer_name_ar: customerNameAr, tab_number: nextNumber, status: "open" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data as Tab;
}

export async function addTabItem(
  tabId: string,
  product: Pick<Product, "id" | "name_ar" | "price">,
  qty: number
) {
  const supabase = getServiceClient();
  const { error } = await supabase.from("tab_items").insert({
    tab_id: tabId,
    product_id: product.id,
    name_snapshot: product.name_ar,
    price_snapshot: product.price,
    qty,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function removeTabItem(tabId: string, itemId: string) {
  const supabase = getServiceClient();
  const { error } = await supabase.from("tab_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function addPayment(tabId: string, amount: number) {
  const supabase = getServiceClient();
  const { error } = await supabase.from("payments").insert({ tab_id: tabId, amount });
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function closeTab(tabId: string) {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("tabs")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", tabId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function countOpenTabs(): Promise<number> {
  const supabase = getServiceClient();
  const { count, error } = await supabase
    .from("tabs")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function resetTabNumbering() {
  if (!(await hasValidAdminSession())) {
    throw new Error("unauthorized");
  }
  const supabase = getServiceClient();
  const { count: openCount, error: countError } = await supabase
    .from("tabs")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");
  if (countError) throw new Error(countError.message);
  if ((openCount ?? 0) > 0) {
    throw new Error("Cannot reset tab numbering while tabs are open");
  }

  const { data: closedTabs, error: listError } = await supabase
    .from("tabs")
    .select("id")
    .eq("status", "closed");
  if (listError) throw new Error(listError.message);
  const ids = (closedTabs as { id: string }[] | null)?.map((t) => t.id) ?? [];

  if (ids.length > 0) {
    const { error: itemsErr } = await supabase.from("tab_items").delete().in("tab_id", ids);
    if (itemsErr) throw new Error(itemsErr.message);
    const { error: paymentsErr } = await supabase.from("payments").delete().in("tab_id", ids);
    if (paymentsErr) throw new Error(paymentsErr.message);
    const { error: tabsErr } = await supabase.from("tabs").delete().in("id", ids);
    if (tabsErr) throw new Error(tabsErr.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function listActiveProducts(): Promise<Product[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("name_ar");
  if (error) throw new Error(error.message);
  await trackUsageBytes(estimateJsonBytes(data));
  return (data as Product[]) ?? [];
}
