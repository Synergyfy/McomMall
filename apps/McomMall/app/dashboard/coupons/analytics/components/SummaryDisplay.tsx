'use client';

import { useGetCouponStats } from '@/service/coupon-products/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CURRENCY } from '@/lib/utils';
import { Gift, Ticket, Zap, ShieldCheck } from 'lucide-react';

export const SummaryDisplay = () => {
    const { data: stats, isLoading } = useGetCouponStats();

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-5">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="mt-3 h-8 w-16" />
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
            value: Number(stats.totalSold).toLocaleString(),
            icon: Ticket,
            description: 'Global volume',
            iconClass: 'bg-blue-50 text-blue-600',
        },
        {
            title: 'Total Redeemed',
            value: Number(stats.totalRedeemed).toLocaleString(),
            icon: Zap,
            description: 'Used by customers',
            iconClass: 'bg-emerald-50 text-emerald-600',
        },
        {
            title: 'Outstanding Liability',
            value: `${CURRENCY}${Number(stats.outstandingLiability).toFixed(2)}`,
            icon: ShieldCheck,
            description: 'Unredeemed value',
            iconClass: 'bg-orange-50 text-orange-600',
        },
        {
            title: 'Active Coupons',
            value: Number(stats.activeCoupons).toLocaleString(),
            icon: Gift,
            description: 'Currently valid',
            iconClass: 'bg-violet-50 text-violet-600',
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryItems.map((item) => (
                <Card
                    key={item.title}
                    className="border-gray-100 shadow-sm transition-shadow hover:shadow-md"
                >
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {item.title}
                                </p>
                                <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                                    {item.value}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconClass}`}
                            >
                                <item.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
