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
import { FeatureToggle } from '../../component/FeatureToggle';
import { BarChart3 } from 'lucide-react';

const PromotionAnalyticsPage = () => {
  const [promotionId, setPromotionId] = useState<string | undefined>();
  const { data: promotions, isLoading } = useGetPromotions();

  useEffect(() => {
    if (promotions && promotions.length > 0) {
      setPromotionId(promotions[0].id);
    }
  }, [promotions]);

  return (
    <div className="space-y-6">
      {/* Header Section - Non-sticky, cleaner integration */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-500">Track performance metrics and customer engagement.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <Select value={promotionId} onValueChange={setPromotionId}>
              <SelectTrigger className="w-full sm:w-[260px] h-10 border-gray-300">
                <SelectValue placeholder="Select a promotion" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading campaigns...
                  </SelectItem>
                ) : (
                  promotions?.map(promotion => (
                    <SelectItem key={promotion.id} value={promotion.id}>
                      {promotion.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <FeatureToggle featureName="promotion" />
        </div>
      </div>

      {/* Main Content */}
      <main className="space-y-8">
        {promotionId ? (
          <>
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PromotionSummary promotionId={promotionId} />
            </section>
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <PromotionTransactionHistory promotionId={promotionId} />
            </section>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Data Available</h3>
            <p className="text-gray-500 max-w-sm mt-2">
              Please select a promotion from the dropdown above to view its performance analytics.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PromotionAnalyticsPage;