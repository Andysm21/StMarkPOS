import { PinGate } from "@/components/seller/pin-gate";
import { Header } from "@/components/header";
import { getTab, listActiveProducts } from "@/app/actions/tabs";
import { TabDetail } from "@/components/seller/tab-detail";
import { notFound } from "next/navigation";

export default async function TabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let data: Awaited<ReturnType<typeof getTab>> | null = null;
  try {
    data = await getTab(id);
  } catch {
    data = null;
  }
  if (!data) notFound();

  const products = await listActiveProducts();

  return (
    <PinGate>
      <div className="flex min-h-dvh flex-col">
        <Header mode="seller" />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
          <TabDetail
            tab={data.tab}
            initialItems={data.items}
            initialPayments={data.payments}
            products={products}
          />
        </main>
      </div>
    </PinGate>
  );
}
