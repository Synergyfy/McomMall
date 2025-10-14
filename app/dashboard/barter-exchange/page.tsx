"use client";

import { useState } from "react";
import { useGetExchangeItems } from "@/service/bertarExchange/hook";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExchangeItemsPage() {
  const [page, setPage] = useState(1);
  const { data: items, isLoading, isError, error } = useGetExchangeItems(page, 10);

  if (isLoading) {
    return <p className="text-center py-10 text-gray-500">Loading exchange items...</p>;
  }

  if (isError) {
    return <p className="text-center text-red-500 py-10">Error: {(error as Error).message}</p>;
  }

  return (
    <section className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-semibold text-center mb-8">All Exchange Items</h1>

      {items && items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="shadow-md hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="capitalize">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Type: <span className="font-medium">{item.itemType}</span>
                </p>
                <p className="text-gray-700 mb-2">{item.description}</p>
                <p className="text-xs text-gray-400">
                  Status: <span className="uppercase">{item.status}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">No exchange items available.</p>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-10">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span className="text-gray-700 mt-2">Page {page}</span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={!items || items.length < 10}
        >
          Next
        </Button>
      </div>
    </section>
  );
}
