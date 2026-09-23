'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Download,
    TrendingUp,
    TrendingDown,
    Store,
    Users,
    Banknote,
    Percent,
    Filter,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetAdminAnalytics } from '@/service/analytics/hook';

type RangeOption = 'today' | '7days' | '30days' | '90days';

// Simple Bar Chart — renders live API series (no hardcoded datasets)
function SimpleBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-sm text-slate-400">
                No data for this period
            </div>
        );
    }
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    return (
        <div className="flex items-end justify-between h-40 gap-2 pt-4">
            {data.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-8 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.value.toLocaleString()}
                    </div>
                    <div
                        className={cn('w-full rounded-t-md transition-all hover:opacity-80', color)}
                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                    />
                    <span className="text-xs text-slate-500 truncate max-w-[48px]">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

function MetricDelta({ change, changeType }: { change: string; changeType: 'up' | 'down' }) {
    const Up = changeType === 'up';
    return (
        <p className={cn('text-xs font-medium flex items-center mt-1', Up ? 'text-emerald-500' : 'text-rose-500')}>
            {Up ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {change} vs previous period
        </p>
    );
}

function ChartSkeleton() {
    return <div className="h-40 rounded-md bg-slate-100 animate-pulse" />;
}

export default function AnalyticsPage() {
    const [range, setRange] = useState<RangeOption>('7days');
    const { data, isLoading, isError, error, refetch } = useGetAdminAnalytics(range);

    const visitorSeries =
        data?.visitorChart.map((p) => ({ label: p.day, value: p.value })) ?? [];
    const revenueSeries =
        data?.revenueChart.map((p) => ({ label: p.day, value: p.value })) ?? [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics &amp; Reporting</h1>
                    <p className="text-slate-500">Live operational insights from the platform API</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-slate-700" disabled={isLoading || !data}>
                        <Download className="h-4 w-4 mr-2" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Range filter — wired to GET /admin/analytics?range= */}
            <Card className="border-0 shadow-sm bg-slate-50/50">
                <CardContent className="p-4 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center text-sm font-medium text-slate-500 mr-2">
                        <Filter className="h-4 w-4 mr-2" /> Filters:
                    </div>
                    <Select value={range} onValueChange={(v) => setRange(v as RangeOption)}>
                        <SelectTrigger className="w-40 bg-white">
                            <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                            <SelectItem value="90days">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load analytics: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* KPI metrics — live from API */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { key: 'visitors', title: 'Active Visitors', icon: Users, metric: data?.visitors },
                    { key: 'signups', title: 'New Signups', icon: Store, metric: data?.signups },
                    { key: 'revenue', title: 'Total Revenue', icon: Banknote, metric: data?.revenue },
                    { key: 'conversion', title: 'Conversion Rate', icon: Percent, metric: data?.conversionRate },
                ].map(({ key, title, icon: Icon, metric }) => (
                    <Card key={key} className="border-0 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Icon className="h-4 w-4" /> {title}
                            </div>
                            {isLoading ? (
                                <div className="h-8 mt-2 rounded bg-slate-100 animate-pulse" />
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{metric?.value ?? '—'}</p>
                                    {metric && <MetricDelta change={metric.change} changeType={metric.changeType} />}
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Storefront Traffic (live visitor chart) */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-blue-500" /> Storefront Traffic
                        </CardTitle>
                        <CardDescription>Distinct active users per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <ChartSkeleton /> : <SimpleBarChart color="bg-blue-500" data={visitorSeries} />}
                    </CardContent>
                </Card>

                {/* Revenue (live revenue chart) */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-emerald-500" /> Revenue
                        </CardTitle>
                        <CardDescription>Order revenue per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <ChartSkeleton /> : <SimpleBarChart color="bg-emerald-500" data={revenueSeries} />}
                    </CardContent>
                </Card>

                {/* Top categories + top businesses + funnel */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Top Categories</CardTitle>
                            <CardDescription>By revenue this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <ChartSkeleton />
                            ) : (data?.topCategories.length ?? 0) === 0 ? (
                                <p className="text-sm text-slate-400 py-8 text-center">No category revenue yet</p>
                            ) : (
                                <ul className="space-y-3">
                                    {data?.topCategories.map((c) => (
                                        <li key={c.name} className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-slate-700 truncate">{c.name}</span>
                                            <span className="text-slate-500">
                                                {c.value} <span className="text-emerald-500 text-xs">{c.change}</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Top Businesses</CardTitle>
                            <CardDescription>By revenue this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <ChartSkeleton />
                            ) : (data?.topBusinesses.length ?? 0) === 0 ? (
                                <p className="text-sm text-slate-400 py-8 text-center">No business revenue yet</p>
                            ) : (
                                <ul className="space-y-3">
                                    {data?.topBusinesses.map((b) => (
                                        <li key={b.name} className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-slate-700 truncate">{b.name}</span>
                                            <span className="text-slate-500">
                                                {b.value} <span className="text-emerald-500 text-xs">{b.change}</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Conversion Funnel</CardTitle>
                            <CardDescription>Visitors → paid orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <ChartSkeleton />
                            ) : (
                                <ul className="space-y-3">
                                    {data?.conversionFunnel.map((f) => (
                                        <li key={f.stage} className="text-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-slate-700">{f.stage}</span>
                                                <span className="text-slate-500">
                                                    {f.value.toLocaleString()} · {f.pct}%
                                                </span>
                                            </div>
                                            <div className="h-2 rounded bg-slate-100 overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded"
                                                    style={{ width: `${Math.min(f.pct, 100)}%` }}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
