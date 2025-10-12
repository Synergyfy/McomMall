"use client";

import { useGetGiftCardStats } from '@/service/gift-card/hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Gift, CreditCard, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const GiftCardStats = () => {
  const { data: stats, isLoading, isError } = useGetGiftCardStats();

  if (isLoading) {
    return <div>Loading gift card stats...</div>;
  }

  if (isError || !stats) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="flex flex-row items-center space-x-3 space-y-0 pb-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <CardTitle className="text-red-800">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">Could not load gift card statistics. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Sold" value={`£${stats.totalSold.toFixed(2)}`} icon={DollarSign} />
      <StatCard title="Total Redeemed" value={`£${stats.totalRedeemed.toFixed(2)}`} icon={CreditCard} />
      <StatCard title="Outstanding Liability" value={`£${stats.outstandingLiability.toFixed(2)}`} icon={Gift} />
      <StatCard title="Active Cards" value={stats.activeCards.toString()} icon={CreditCard} />
    </div>
  );
};

export default GiftCardStats;