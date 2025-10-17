'use client';

import { useGetSummaryStatistics } from '@/service/gift-card/hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const GiftCardChart = () => {
  const { data: summaryStats, isLoading } = useGetSummaryStatistics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!summaryStats || !summaryStats.chartData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales vs. Redemptions by Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summaryStats.chartData.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" name="Sales" />
            <Bar dataKey="redemptions" fill="#82ca9d" name="Redemptions" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
