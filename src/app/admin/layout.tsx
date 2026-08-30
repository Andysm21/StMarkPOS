import { Header } from "@/components/header";
import { AdminNav } from "@/components/admin/admin-nav";
import { UsageBanner } from "@/components/admin/usage-banner";
import { getLowStockProducts } from "@/app/admin/products/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const lowStockProducts = await getLowStockProducts().catch(() => []);
  return (
    <div className="flex min-h-dvh flex-col">
      <Header mode="admin" />
      <div className="border-b bg-card">
        <AdminNav lowStockProducts={lowStockProducts} />
      </div>
      <UsageBanner />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
