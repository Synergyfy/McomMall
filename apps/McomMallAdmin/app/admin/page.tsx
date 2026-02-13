'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGetAdminDashboard } from '@/service/dispute/hook';
import {
    Users,
    ListChecks,
    Ticket,
    CreditCard,
    RefreshCw,
    PoundSterling,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ArrowRight,
    Plus,
    Eye,
    Activity,
    Building2,
    Loader2,
    UserPlus,
} from 'lucide-react';
import { CreateUserDialog } from './users/components/CreateUserDialog';
import { cn } from '@/lib/utils';

// Stat Card Component
function StatCard({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    href,
    color,
    loading = false,
}: {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'up' | 'down' | 'neutral';
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    color: 'orange' | 'blue' | 'green' | 'purple' | 'red' | 'yellow';
    loading?: boolean;
}) {
    const colorStyles = {
        orange: 'from-orange-500 to-orange-600 shadow-orange-500/25',
        blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
        green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25',
        purple: 'from-purple-500 to-purple-600 shadow-purple-500/25',
        red: 'from-red-500 to-red-600 shadow-red-500/25',
        yellow: 'from-amber-500 to-amber-600 shadow-amber-500/25',
    };

    const content = (
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-md">
            <div className={cn(
                'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity',
                `bg-gradient-to-br ${colorStyles[color]}`
            )} />
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <div className="flex items-baseline gap-2">
                            {loading ? (
                                <div className="h-9 w-24 bg-slate-100 animate-pulse rounded" />
                            ) : (
                                <p className="text-3xl font-bold text-slate-900">{value}</p>
                            )}
                        </div>
                        {change && !loading && (
                            <div className="flex items-center gap-1">
                                {changeType === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                                {changeType === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                                <span className={cn(
                                    'text-sm font-medium',
                                    changeType === 'up' && 'text-emerald-500',
                                    changeType === 'down' && 'text-red-500',
                                    changeType === 'neutral' && 'text-slate-500'
                                )}>
                                    {change}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={cn(
                        'p-3 rounded-xl bg-gradient-to-br shadow-lg',
                        colorStyles[color]
                    )}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }
    return content;
}

// Quick Action Button
function QuickAction({
    title,
    icon: Icon,
    href,
    onClick,
    variant = 'default',
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    onClick?: () => void;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
    const variants = {
        default: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
        success: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700',
        warning: 'bg-amber-100 hover:bg-amber-200 text-amber-700',
        danger: 'bg-red-100 hover:bg-red-200 text-red-700',
    };

    const button = (
        <Button
            variant="ghost"
            onClick={onClick}
            className={cn(
                'h-auto py-4 px-6 flex flex-col items-center gap-2 rounded-xl transition-all duration-200',
                variants[variant]
            )}
        >
            <Icon className="h-6 w-6" />
            <span className="text-sm font-medium">{title}</span>
        </Button>
    );

    if (href) {
        return <Link href={href}>{button}</Link>;
    }
    return button;
}

// Activity Item Component
function ActivityItemCard({
    type,
    message,
    timestamp,
}: {
    type: string;
    message: string;
    timestamp: string;
}) {
    const getIcon = () => {
        switch (type) {
            case 'listing':
                return <ListChecks className="h-4 w-4 text-blue-500" />;
            case 'user':
                return <Users className="h-4 w-4 text-purple-500" />;
            case 'transaction':
                return <CreditCard className="h-4 w-4 text-emerald-500" />;
            case 'refund':
                return <RefreshCw className="h-4 w-4 text-orange-500" />;
            case 'verification':
                return <CheckCircle2 className="h-4 w-4 text-teal-500" />;
            default:
                return <Activity className="h-4 w-4 text-slate-500" />;
        }
    };

    const formatTime = (ts: string) => {
        const date = new Date(ts);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="p-2 rounded-full bg-slate-100">{getIcon()}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900">
                    <span className="font-medium">{message}</span>
                </p>
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(timestamp)}</span>
        </div>
    );
}


export default function AdminDashboard() {
    const { data: dashboard, isLoading } = useGetAdminDashboard();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);


    const stats = dashboard?.stats;
    const analytics = dashboard?.analytics;
    const recentActivity = dashboard?.recentActivity || [];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Pending Listings"
                    value={stats?.pendingListings || 0}
                    loading={isLoading}
                    icon={ListChecks}
                    href="/admin/listings?status=pending"
                    color="orange"
                />
                <StatCard
                    title="New Signups (24h)"
                    value={stats?.newSignups24h || 0}
                    loading={isLoading}
                    icon={Users}
                    href="/admin/users"
                    color="blue"
                />
                <StatCard
                    title="Transactions Today"
                    value={stats?.transactionsToday || 0}
                    loading={isLoading}
                    icon={CreditCard}
                    href="/admin/transactions"
                    color="purple"
                />
                <StatCard
                    title="Revenue Today"
                    value={`£${(stats?.revenueToday || 0).toLocaleString()}`}
                    loading={isLoading}
                    icon={PoundSterling}
                    href="/admin/transactions"
                    color="green"
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Active Users"
                    value={(stats?.activeUsers || 0).toLocaleString()}
                    loading={isLoading}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Total Businesses"
                    value={(stats?.totalBusinesses || 0).toLocaleString()}
                    loading={isLoading}
                    icon={Building2}
                    color="yellow"
                />
                <StatCard
                    title="Weekly Signups"
                    value={(analytics?.weeklySignups || 0).toLocaleString()}
                    loading={isLoading}
                    icon={TrendingUp}
                    color="purple"
                />
                <StatCard
                    title="Weekly Revenue"
                    value={`£${(analytics?.weeklyRevenue || 0).toLocaleString()}`}
                    loading={isLoading}
                    icon={PoundSterling}
                    color="green"
                />
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <QuickAction
                            title="Approve Listings"
                            icon={CheckCircle2}
                            href="/admin/listings?status=pending"
                            variant="success"
                        />
                        <QuickAction
                            title="Create User"
                            icon={UserPlus}
                            onClick={() => setIsCreateDialogOpen(true)}
                            variant="default"
                        />
                        <QuickAction
                            title="Create Coupon"
                            icon={Plus}
                            href="/admin/coupons-vouchers"
                            variant="default"
                        />
                        <QuickAction
                            title="Process Refunds"
                            icon={RefreshCw}
                            href="/admin/transactions?type=refund"
                            variant="warning"
                        />
                        <QuickAction
                            title="Create Banner"
                            icon={Plus}
                            href="/admin/content/banners/new"
                            variant="default"
                        />
                        <QuickAction
                            title="View Reports"
                            icon={Eye}
                            href="/admin/analytics"
                            variant="default"
                        />
                        <QuickAction
                            title="Handle Disputes"
                            icon={AlertTriangle}
                            href="/admin/disputes"
                            variant="danger"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                        <CardDescription>Latest platform events</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-600">
                        View All
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-100 animate-pulse rounded w-3/4" />
                                        <div className="h-3 bg-slate-100 animate-pulse rounded w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : recentActivity.length > 0 ? (
                            recentActivity.map((item, i) => (
                                <ActivityItemCard
                                    key={i}
                                    type={item.type}
                                    message={item.message}
                                    timestamp={item.timestamp}
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500">No recent activity</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Mini Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Weekly Signups Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {isLoading ? '...' : (analytics?.weeklySignups || 0).toLocaleString()}
                        </div>
                        <div className="mt-4 flex items-end justify-between h-24 gap-1">
                            {isLoading ? (
                                Array(7).fill(0).map((_, i) => (
                                    <div key={i} className="flex-1 bg-slate-100 animate-pulse rounded-t-sm" style={{ height: '40%' }} />
                                ))
                            ) : analytics?.signups.map((point, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ height: `${(point.value / (Math.max(...analytics.signups.map(s => s.value)) || 1)) * 100}%` }}
                                    title={`${point.date}: ${point.value.toLocaleString()}`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                            {analytics?.signups.map((point, i) => (
                                <span key={i} className="truncate">{new Date(point.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Weekly Revenue Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {isLoading ? '...' : `£${(analytics?.weeklyRevenue || 0).toLocaleString()}`}
                        </div>
                        <div className="mt-4 flex items-end justify-between h-24 gap-1">
                            {isLoading ? (
                                Array(7).fill(0).map((_, i) => (
                                    <div key={i} className="flex-1 bg-slate-100 animate-pulse rounded-t-sm" style={{ height: '50%' }} />
                                ))
                            ) : analytics?.revenue.map((point, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ height: `${(point.value / (Math.max(...analytics.revenue.map(r => r.value)) || 1)) * 100}%` }}
                                    title={`${point.date}: £${point.value.toLocaleString()}`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                            {analytics?.revenue.map((point, i) => (
                                <span key={i} className="truncate">{new Date(point.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <CreateUserDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    );
}
