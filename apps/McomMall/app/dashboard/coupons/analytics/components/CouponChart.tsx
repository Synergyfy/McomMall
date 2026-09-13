'use client';

import { useGetCouponChartData } from '@/service/coupon-products/hooks';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

const chartTooltipStyle = {
    borderRadius: '10px',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    fontSize: '12px',
    fontFamily: 'inherit',
};

export const CouponChart = () => {
    const { data: chartData, isLoading } = useGetCouponChartData();

    if (isLoading) {
        return (
            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!chartData || !chartData.data) return null;

    return (
        <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-900">
                        Sales vs. Redemptions
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Monthly coupon sales compared to redemptions over time.
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.data} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                dy={8}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                width={44}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(245,130,32,0.06)' }}
                                contentStyle={chartTooltipStyle}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
                            />
                            <Bar
                                dataKey="sales"
                                fill="#f58220"
                                name="Sales"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={28}
                            />
                            <Bar
                                dataKey="redemptions"
                                fill="#10b981"
                                name="Redemptions"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={28}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
