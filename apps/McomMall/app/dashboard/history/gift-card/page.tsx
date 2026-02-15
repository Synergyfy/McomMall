"use client";

import { useState } from "react";
import { useGetMyPurchases } from "@/service/gift-card/hook";
import { MyPurchase } from "@/service/gift-card/types";
import { Gift, Loader2, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import dynamic from "next/dynamic";
const HistoryGiftCard = dynamic(() => import("@/app/dashboard/component/HistoryMarketingCards").then(mod => mod.HistoryGiftCard), {
  loading: () => <div className="aspect-[1.58/1] w-full bg-slate-100 animate-pulse rounded-[2rem]" />,
  ssr: false
});
import ReloadModal from "./components/ReloadModal";
import { useShareLink } from "@/lib/hooks/useShareLink";

const GiftCardHistoryPage = () => {
  const { data: purchases, isPending, isError } = useGetMyPurchases();
  const [selectedPurchase, setSelectedPurchase] = useState<MyPurchase | null>(
    null
  );
  const { copiedLink, handleShare } = useShareLink();

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load gift card history. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Gift Card History</h1>
          <p className="text-slate-500 font-bold text-sm mt-2 uppercase tracking-widest">
            Home &gt; Dashboard &gt; History
          </p>
        </header>

        {purchases && purchases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {purchases.map((purchase: MyPurchase) => (
              <HistoryGiftCard
                key={purchase.id}
                purchase={purchase}
                onShare={(id) => handleShare('giftcard', id)}
                onReload={setSelectedPurchase}
                isShared={copiedLink === purchase.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <Gift className="mx-auto text-gray-200 mb-6" size={64} />
            <h3 className="text-2xl font-black text-gray-900">No Gift Cards Yet</h3>
            <p className="text-gray-500 font-bold mt-2">You haven't purchased any gift cards.</p>
          </div>
        )}
      </main>

      {selectedPurchase && (
        <ReloadModal
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}
    </div>
  );
};

export default GiftCardHistoryPage;
