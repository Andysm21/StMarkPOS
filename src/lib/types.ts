export type Product = {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  quantity_on_hand: number;
  image_url: string | null;
  category: string | null;
  active: boolean;
  created_at: string;
};

export type Tab = {
  id: string;
  tab_number: number;
  customer_name_ar: string;
  status: "open" | "closed";
  total_charged: number;
  total_paid: number;
  created_at: string;
  closed_at: string | null;
};

export type TabItem = {
  id: string;
  tab_id: string;
  product_id: string | null;
  name_snapshot: string;
  price_snapshot: number;
  qty: number;
  created_at: string;
};

export type Payment = {
  id: string;
  tab_id: string;
  amount: number;
  created_at: string;
};

export type QuickSale = {
  id: string;
  total: number;
  created_at: string;
};

export type QuickSaleItem = {
  id: string;
  quick_sale_id: string;
  product_id: string | null;
  name_snapshot: string;
  price_snapshot: number;
  qty: number;
};
