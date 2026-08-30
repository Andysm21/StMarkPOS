import { Header } from "@/components/header";
import { AdminNav } from "@/components/admin/admin-nav";
import { UsageBanner } from "@/components/admin/usage-banner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header mode="admin" />
      <div className="border-b bg-card">
        <AdminNav />
      </div>
      <UsageBanner />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
