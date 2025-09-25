"use client";

import { useGetMyPurchases } from "@/service/gift-card/hook";
import { MyPurchase } from "@/service/gift-card/types";
import { format } from "date-fns";

const GiftCardHistoryPage = () => {
  const { data: purchases, isPending, isError } = useGetMyPurchases();

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {purchases && purchases.length > 0 ? (
          purchases.map((purchase: MyPurchase) => (
            <div
              key={purchase.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {purchase.purchaseBusiness.businessName}
                  </h2>
                  <span className="text-sm font-medium text-white bg-orange-600 px-3 py-1 rounded-full">
                    Gift Card
                  </span>
                </div>

                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Code:</span> {purchase.code}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Recipient:</span> {purchase.recipientEmail}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-lg">
                    <p className="font-bold text-gray-800">
                      Initial: <span className="text-orange-600">£{Number(purchase.initialBalance).toFixed(2)}</span>
                    </p>
                    <p className="font-bold text-gray-800">
                      Current: <span className="text-green-600">£{Number(purchase.currentBalance).toFixed(2)}</span>
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mt-4 text-right">
                  Purchased on {format(new Date(purchase.createdAt), "PPP")}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 text-center py-10">
            <p className="text-xl text-gray-500">You haven&apos;t purchased any gift cards yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardHistoryPage;