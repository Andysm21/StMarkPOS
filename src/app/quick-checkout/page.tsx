import { PinGate } from "@/components/seller/pin-gate";
import { Header } from "@/components/header";
import { listActiveProductsForCheckout } from "@/app/actions/quick-sale";
import { QuickCheckoutClient } from "@/components/seller/quick-checkout-client";

export default async function QuickCheckoutPage() {
  const products = await listActiveProductsForCheckout();
  return (
    <PinGate>
      <div className="flex min-h-dvh flex-col">
        <Header mode="seller" />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
          <QuickCheckoutClient products={products} />
        </main>
      </div>
    </PinGate>
  );
}
