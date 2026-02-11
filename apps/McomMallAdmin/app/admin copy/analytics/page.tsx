'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useGetAdminAnalytics } from '@/service/analytics/hook';
import { ChartItem } from '@/service/analytics/types';
import {
    Download,
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Eye,
    ShoppingCart,
    ArrowRight,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Metric Card
function MetricCard({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    color,
}: {
    title: string;
    value: string;
    change: string;
    changeType: 'up' | 'down';
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}) {
    return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">{title}</p>
                        <p className="text-3xl font-bold text-slate-900">{value}</p>
                        <div className="flex items-center gap-1 mt-2">
                            {changeType === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={cn(
                                'text-sm font-medium',
                                changeType === 'up' ? 'text-emerald-500' : 'text-red-500'
                            )}>
                                {change}
                            </span>
                            <span className="text-sm text-slate-400">vs last period</span>
                        </div>
                    </div>
                    <div className={cn('p-4 rounded-2xl', color)}>
                        <Icon className="h-8 w-8 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Bar Chart Component (Simple CSS-based)
function SimpleBarChart({
    data,
    color,
}: {
    data: ChartItem[];
    color: string;
}) {
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className="flex items-end justify-between h-48 gap-2 pt-4">
            {data.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                    <div
                        className={cn('w-full rounded-t-md transition-all hover:opacity-80', color)}
                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                    />
                    <span className="text-xs text-slate-500">{item.day}</span>
                </div>
            ))}
        </div>
    );
}

// Top Items List
function TopItemsList({
    items,
}: {
    items: { name: string; value: string; change: string }[];
}) {
    return (
        <div className="space-y-3">
            {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                            {i + 1}
                        </div>
                        <span className="font-medium text-slate-900">{item.name}</span>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-slate-900">{item.value}</p>
                        <p className="text-xs text-emerald-500">{item.change}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AnalyticsPage() {
    const [range, setRange] = useState('7days');
    const { data: analytics, isLoading } = useGetAdminAnalytics(range);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-slate-500">Platform performance and insights</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-40">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                            <SelectItem value="90days">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Visitors"
                    value={isLoading ? '...' : analytics?.visitors.value || '0'}
                    change={isLoading ? '' : analytics?.visitors.change || ''}
                    changeType={analytics?.visitors.changeType || 'up'}
                    icon={Eye}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <MetricCard
                    title="New Signups"
                    value={isLoading ? '...' : analytics?.signups.value || '0'}
                    change={isLoading ? '' : analytics?.signups.change || ''}
                    changeType={analytics?.signups.changeType || 'up'}
                    icon={Users}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                />
                <MetricCard
                    title="Total Revenue"
                    value={isLoading ? '...' : (analytics?.revenue.value.startsWith('£') ? analytics.revenue.value : `£${analytics?.revenue.value || '0'}`)}
                    change={isLoading ? '' : analytics?.revenue.change || ''}
                    changeType={analytics?.revenue.changeType || 'up'}
                    icon={DollarSign}
                    color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={isLoading ? '...' : analytics?.conversionRate.value || '0%'}
                    change={isLoading ? '' : analytics?.conversionRate.change || ''}
                    changeType={analytics?.conversionRate.changeType || 'up'}
                    icon={ShoppingCart}
                    color="bg-gradient-to-br from-orange-500 to-orange-600"
                />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Visitors Chart */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg">Visitor Traffic</CardTitle>
                            <CardDescription>Daily visitors over the last 7 days</CardDescription>
                        </div>
                        <BarChart3 className="h-5 w-5 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-48 flex items-center justify-center">
                                <span className="text-slate-300">Loading chart...</span>
                            </div>
                        ) : (
                            <SimpleBarChart
                                data={analytics?.visitorChart || []}
                                color="bg-gradient-to-t from-blue-500 to-blue-400"
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg">Revenue</CardTitle>
                            <CardDescription>Daily revenue over the last 7 days</CardDescription>
                        </div>
                        <Activity className="h-5 w-5 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-48 flex items-center justify-center">
                                <span className="text-slate-300">Loading chart...</span>
                            </div>
                        ) : (
                            <SimpleBarChart
                                data={analytics?.revenueChart || []}
                                color="bg-gradient-to-t from-emerald-500 to-emerald-400"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Lists */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Top Categories */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Top Categories</CardTitle>
                        <CardDescription>By revenue this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <TopItemsList
                                items={(analytics?.topCategories || []).map(item => ({
                                    ...item,
                                    value: item.value.replace('$', '£')
                                }))}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Top Businesses */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Top Businesses</CardTitle>
                        <CardDescription>By revenue this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <TopItemsList
                                items={(analytics?.topBusinesses || []).map(item => ({
                                    ...item,
                                    value: item.value.replace('$', '£')
                                }))}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Conversion Funnel */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Conversion Funnel</CardTitle>
                        <CardDescription>User journey this month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="space-y-6">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 bg-slate-50 animate-pulse rounded w-1/2" />
                                        <div className="h-2 bg-slate-50 animate-pulse rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            (analytics?.conversionFunnel || []).map((item, i) => (
                                <div key={item.stage} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-900">{item.stage}</span>
                                        <span className="text-slate-500">{item.value.toLocaleString()} ({item.pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                                            style={{ width: `${item.pct}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
