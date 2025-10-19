"use client";

import { useState } from "react";
import { useGetMyPurchases } from "@/service/gift-card/hook";
import { MyPurchase } from "@/service/gift-card/types";
import { format } from "date-fns";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import GiftCard from "./components/GiftCard";
import ReloadModal from "./components/ReloadModal";

const GiftCardHistoryPage = () => {
  const { data: purchases, isPending, isError } = useGetMyPurchases();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<MyPurchase | null>(
    null
  );

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-10">
        <p>Failed to load purchase history. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Gift Card History</h1>
        <p className="text-lg text-gray-600 mt-2">
          Browse your gift card purchase history below.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {purchases && purchases.length > 0 ? (
          purchases.map((purchase: MyPurchase) => (
            <div key={purchase.id} className="rounded-lg overflow-hidden">
              <GiftCard purchase={purchase} />
              <div className="p-6 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-700 mb-4">
                  <span className="font-semibold">Code:</span>
                  <span className="font-mono">{purchase.code}</span>
                  {copiedCode === purchase.code ? (
                    <Check className="text-green-500" size={16} />
                  ) : (
                    <Copy
                      className="cursor-pointer text-gray-500 hover:text-orange-600"
                      size={16}
                      onClick={() => handleCopy(purchase.code)}
                    />
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>
                      Initial: £{Number(purchase.initialBalance).toFixed(2)}
                    </span>
                    <span>
                      Purchased: {format(new Date(purchase.createdAt), "PPP")}
                    </span>
                  </div>
                </div>

                {purchase.isReloadable && (
                  <div className="mt-4">
                    <button
                      onClick={() => setSelectedPurchase(purchase)}
                      className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Reload Gift Card
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 text-center py-10">
            <p className="text-xl text-gray-500">
              You haven&apos;t purchased any gift cards yet.
            </p>
          </div>
        )}
      </div>
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