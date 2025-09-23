'use client';

import type { FC } from 'react';
import {
  ShoppingCart,
  Package,
  BarChart2,
  MoreHorizontal,
} from 'lucide-react';

// Import Shadcn UI Components
import { Card, CardContent } from '@/components/ui/card';

import { useGetCustomerStats } from '@/service/user/hook';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className={`text-3xl font-bold ${color}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      <div className={color}>{icon}</div>
    </CardContent>
  </Card>
);

const CustomerDashboard: FC = () => {
  const { data: customerStats, isLoading } = useGetCustomerStats();

  const stats: StatCardProps[] = isLoading
    ? [
        {
          title: 'Total Orders',
          value: 'loading...',
          icon: <ShoppingCart className="h-8 w-8" />,
          color: 'text-green-500',
        },
        {
          title: 'Total Spent',
          value: 'loading...',
          icon: <Package className="h-8 w-8" />,
          color: 'text-blue-500',
        },
        {
          title: 'Promotion Points',
          value: 'loading...',
          icon: <BarChart2 className="h-8 w-8" />,
          color: 'text-yellow-500',
        },
        {
          title: 'Promotions Participating',
          value: 'loading...',
          icon: <MoreHorizontal className="h-8 w-8" />,
          color: 'text-red-500',
        },
      ]
    : [
        {
          title: 'Total Orders',
          value: customerStats?.totalOrders ?? 0,
          icon: <ShoppingCart className="h-8 w-8" />,
          color: 'text-green-500',
        },
        {
          title: 'Total Spent',
          value: `£${customerStats?.totalSpent.toFixed(2) ?? '0.00'}`,
          icon: <Package className="h-8 w-8" />,
          color: 'text-blue-500',
        },
        {
          title: 'Promotion Points',
          value: customerStats?.promotionPoints ?? 0,
          icon: <BarChart2 className="h-8 w-8" />,
          color: 'text-yellow-500',
        },
        {
          title: 'Promotions Participating',
          value: customerStats?.promotionsParticipating ?? 0,
          icon: <MoreHorizontal className="h-8 w-8" />,
          color: 'text-red-500',
        },
      ];
  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(stat => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </section>
  );
};

export default CustomerDashboard;
