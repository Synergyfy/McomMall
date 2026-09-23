'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    MessageSquare,
    Calendar,
    Megaphone,
    Store,
    Activity as ActivityIcon,
    ShoppingBag,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetAdminActivities, AdminActivity } from '@/service/activities/hook';

function timeAgo(value?: string): string {
    if (!value) return '';
    const diff = Date.now() - new Date(value).getTime();
    if (isNaN(diff)) return '';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function displayName(user: AdminActivity['user']): string {
    if (!user) return 'System';
    return user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'User';
}

function activityStyle(activity: AdminActivity): { icon: typeof MessageSquare; color: string } {
    const hay = `${activity.action} ${activity.target}`.toLowerCase();
    if (hay.includes('order')) return { icon: ShoppingBag, color: 'text-orange-500 bg-orange-100' };
    if (hay.includes('book')) return { icon: Calendar, color: 'text-purple-500 bg-purple-100' };
    if (hay.includes('promo')) return { icon: Megaphone, color: 'text-orange-500 bg-orange-100' };
    if (hay.includes('listing') || hay.includes('business') || hay.includes('store')) {
        return { icon: Store, color: 'text-emerald-500 bg-emerald-100' };
    }
    if (hay.includes('review') || hay.includes('message') || hay.includes('comment')) {
        return { icon: MessageSquare, color: 'text-blue-500 bg-blue-100' };
    }
    return { icon: ActivityIcon, color: 'text-slate-500 bg-slate-100' };
}

export default function CommunityActivityPage() {
    const { data, isLoading, isError, error, refetch } = useGetAdminActivities();

    const activities = useMemo(() => {
        const list = [...(data ?? [])];
        list.sort(
            (a, b) =>
                new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
        );
        return list;
    }, [data]);

    const targetCounts = useMemo(() => {
        const map = new Map<string, number>();
        for (const a of activities) {
            map.set(a.target, (map.get(a.target) ?? 0) + 1);
        }
        return [...map.entries()].sort((x, y) => y[1] - x[1]).slice(0, 6);
    }, [activities]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Community &amp; Activity</h1>
                    <p className="text-slate-500">Live platform activity from the API</p>
                </div>
                <Link href="/admin/notifications">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        <Megaphone className="h-4 w-4 mr-2" /> Send Community Blast
                    </Button>
                </Link>
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load activity: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-0 shadow-sm overflow-hidden flex flex-col">
                        <CardHeader className="pb-3 border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-500" /> Live Feed
                            </CardTitle>
                            <CardDescription>
                                {isLoading ? 'Loading…' : `${activities.length} recent actions`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto flex-1 bg-slate-50/50 max-h-[calc(100vh-240px)]">
                            {isLoading ? (
                                <div className="p-4 space-y-3">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                                    ))}
                                </div>
                            ) : activities.length === 0 ? (
                                <p className="p-12 text-center text-sm text-slate-400">No activity recorded yet.</p>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {activities.map((item) => {
                                        const { icon: Icon, color } = activityStyle(item);
                                        return (
                                            <div key={item.id} className="p-4 hover:bg-white transition-colors">
                                                <div className="flex gap-3">
                                                    <div className={cn('p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0', color)}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center justify-between gap-4 mb-1">
                                                            <p className="font-semibold text-sm text-slate-900 capitalize">
                                                                {item.action.replace(/_/g, ' ')} · {item.target.replace(/_/g, ' ')}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                                                {timeAgo(item.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 leading-snug truncate">
                                                            {item.targetName} — {displayName(item.user)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Activity by Target</CardTitle>
                            <CardDescription>Live counts grouped by target type</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {isLoading ? (
                                <div className="h-24 rounded bg-slate-100 animate-pulse" />
                            ) : targetCounts.length === 0 ? (
                                <p className="text-sm text-slate-400 py-4 text-center">No data.</p>
                            ) : (
                                targetCounts.map(([target, count]) => (
                                    <div key={target} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                                        <span className="text-sm font-medium text-slate-700 capitalize">
                                            {target.replace(/_/g, ' ')}
                                        </span>
                                        <Badge variant="secondary">{count}</Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Recently Active Users</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isLoading ? (
                                <div className="h-20 rounded bg-slate-100 animate-pulse" />
                            ) : (
                                [...new Map(
                                    activities
                                        .filter((a) => a.user)
                                        .map((a) => [a.user?.id, a] as const),
                                ).values()].slice(0, 5).map((a) => (
                                    <div key={a.user?.id} className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-[11px] bg-slate-200 text-slate-600">
                                                {displayName(a.user).slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">{displayName(a.user)}</p>
                                            <p className="text-xs text-slate-400">{timeAgo(a.created_at)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-slate-900 text-white">
                        <CardContent className="p-4 text-sm text-slate-300">
                            Maps, heat layers and foot-traffic overlays are not provided by the API — this
                            view shows the live action feed instead of simulated geography.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
