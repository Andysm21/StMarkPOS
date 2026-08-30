import { PinGate } from "@/components/seller/pin-gate";
import { Header } from "@/components/header";
import { listOpenTabs } from "@/app/actions/tabs";
import { SellerHome } from "@/components/seller/seller-home";

export default async function SellerPage() {
  const tabs = await listOpenTabs();
  return (
    <PinGate>
      <div className="flex min-h-dvh flex-col">
        <Header mode="seller" />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          <SellerHome initialTabs={tabs} />
        </main>
      </div>
    </PinGate>
  );
}
