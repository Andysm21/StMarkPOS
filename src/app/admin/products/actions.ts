"use server";

import { getServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Product } from "@/lib/types";

export type ProductInput = {
  name_ar: string;
  name_en: string;
  price: number;
  quantity_on_hand: number;
  category: string;
  active: boolean;
  image_url: string | null;
};

export async function createProduct(input: ProductInput) {
  const supabase = getServiceClient();
  const { error } = await supabase.from("products").insert(input);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const supabase = getServiceClient();
  const { error } = await supabase.from("products").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}

export async function deleteProduct(id: string) {
  const supabase = getServiceClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}

export async function listAllProducts(): Promise<Product[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Product[]) ?? [];
}
