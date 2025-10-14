'use client';

import { useGetSummaryStatistics } from '@/service/gift-card/hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SummaryDisplay = () => {
  const { data: summaryStats, isLoading } = useGetSummaryStatistics();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/3" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summaryStats) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Total Active Gift Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summaryStats.summary.totalGiftCards}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Liability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(summaryStats.summary.totalLiability)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
