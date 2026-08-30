"use server";

import { getServiceClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export type CartLine = {
  product_id: string;
  name_snapshot: string;
  price_snapshot: number;
  qty: number;
};

export async function submitQuickSale(lines: CartLine[]) {
  if (lines.length === 0) throw new Error("empty cart");
  const supabase = getServiceClient();
  const total = lines.reduce((sum, l) => sum + l.price_snapshot * l.qty, 0);

  const { data: sale, error } = await supabase
    .from("quick_sales")
    .insert({ total })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  const saleId = (sale as { id: string }).id;
  const { error: itemsError } = await supabase.from("quick_sale_items").insert(
    lines.map((l) => ({
      quick_sale_id: saleId,
      product_id: l.product_id,
      name_snapshot: l.name_snapshot,
      price_snapshot: l.price_snapshot,
      qty: l.qty,
    }))
  );
  if (itemsError) throw new Error(itemsError.message);

  return { id: saleId, total };
}

export async function listActiveProductsForCheckout(): Promise<Product[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("name_ar");
  if (error) throw new Error(error.message);
  return (data as Product[]) ?? [];
}
