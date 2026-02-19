'use client';

import { useGetCouponStats } from '@/service/coupon-products/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CURRENCY } from '@/lib/utils';
import { Gift, Ticket, Zap, ShieldCheck } from 'lucide-react';

export const SummaryDisplay = () => {
    const { data: stats, isLoading } = useGetCouponStats();

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const summaryItems = [
        {
            title: 'Total Coupons Sold',
            value: stats.totalSold,
            icon: Ticket,
            description: 'Global volume',
            color: 'text-blue-600',
        },
        {
            title: 'Total Redeemed',
            value: stats.totalRedeemed,
            icon: Zap,
            description: 'Used by customers',
            color: 'text-green-600',
        },
        {
            title: 'Outstanding Liability',
            value: `${CURRENCY}${Number(stats.outstandingLiability).toFixed(2)}`,
            icon: ShieldCheck,
            description: 'Unredeemed value',
            color: 'text-orange-600',
        },
        {
            title: 'Active Coupons',
            value: stats.activeCoupons,
            icon: Gift,
            description: 'Currently valid',
            color: 'text-purple-600',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {summaryItems.map((item) => (
                <Card key={item.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
