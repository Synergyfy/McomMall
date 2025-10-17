'use client';

import { PromotionSummary } from './components/PromotionSummary';
import { PromotionTransactionHistory } from './components/PromotionTransactionHistory';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useGetPromotions } from '@/service/admin';

const PromotionAnalyticsPage = () => {
  const [promotionId, setPromotionId] = useState<string | undefined>();
  const { data: promotions, isLoading } = useGetPromotions();

  useEffect(() => {
    if (promotions && promotions.length > 0) {
      setPromotionId(promotions[0].id);
    }
  }, [promotions]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Promotion Analytics</h1>
        <Select value={promotionId} onValueChange={setPromotionId}>
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Select a promotion" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : (
              promotions?.map((promotion) => (
                <SelectItem key={promotion.id} value={promotion.id}>
                  {promotion.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      {promotionId && (
        <>
          <PromotionSummary promotionId={promotionId} />
          <PromotionTransactionHistory promotionId={promotionId} />
        </>
      )}
    </div>
  );
};

export default PromotionAnalyticsPage;