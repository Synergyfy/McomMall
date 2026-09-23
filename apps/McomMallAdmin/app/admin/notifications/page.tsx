'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Bell,
    Megaphone,
    Calendar,
    Send,
    AlertTriangle,
    Loader2,
    CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    useGetNotifications,
    useBroadcastNotification,
    useMarkNotificationsAsSeen,
} from '@/service/notifications/hook';
import type { BroadcastType } from '@/service/notifications/types';

function typeLabel(type: string): string {
    switch (type) {
        case 'new_order':
            return 'New order';
        case 'new_booking':
            return 'New booking';
        case 'new_message':
            return 'New message';
        case 'broadcast_alert':
            return 'Broadcast';
        case 'event_invite':
            return 'Event invite';
        default:
            return type.replace(/_/g, ' ');
    }
}

export default function NotificationsPage() {
    const { notifications, isLoading, isError, error, refetch, unseenIds } = useGetNotifications();
    const broadcast = useBroadcastNotification();
    const markSeen = useMarkNotificationsAsSeen();

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [broadcastType, setBroadcastType] = useState<BroadcastType>('broadcast_alert');

    const counts = useMemo(() => {
        const list = notifications ?? [];
        const by = (t: string) => list.filter((n) => n.type === t).length;
        return {
            total: list.length,
            unseen: (unseenIds ?? []).length,
            orders: by('new_order'),
            bookings: by('new_booking'),
            messages: by('new_message'),
        };
    }, [notifications, unseenIds]);

    const recent = useMemo(() => (notifications ?? []).slice(0, 8), [notifications]);

    const canSend = title.trim().length > 0 && message.trim().length > 0 && !broadcast.isPending;

    const handleSend = () => {
        broadcast.mutate(
            { title: title.trim(), message: message.trim(), type: broadcastType },
            {
                onSuccess: () => {
                    setTitle('');
                    setMessage('');
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications &amp; Communication</h1>
                    <p className="text-slate-500">Live inbox and broadcast composer from the API</p>
                </div>
                {(unseenIds?.length ?? 0) > 0 && (
                    <Button
                        variant="outline"
                        disabled={markSeen.isPending}
                        onClick={() => markSeen.mutate({ notificationIds: unseenIds })}
                    >
                        <CheckCheck className="h-4 w-4 mr-2" /> Mark all seen ({unseenIds.length})
                    </Button>
                )}
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load notifications: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <Card className="border-0 shadow-sm bg-slate-900 text-white h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-400" /> Inbox Overview
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Live counts from GET /notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isLoading ? (
                                [0, 1, 2].map((i) => (
                                    <div key={i} className="h-12 rounded-lg bg-slate-800 animate-pulse" />
                                ))
                            ) : (
                                <>
                                    {[
                                        { label: 'Unseen notifications', value: counts.unseen },
                                        { label: 'New orders', value: counts.orders },
                                        { label: 'New bookings', value: counts.bookings },
                                        { label: 'New messages', value: counts.messages },
                                        { label: 'Total in inbox', value: counts.total },
                                    ].map((row) => (
                                        <div
                                            key={row.label}
                                            className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700"
                                        >
                                            <span className="font-medium text-sm">{row.label}</span>
                                            <Badge className="bg-slate-700 hover:bg-slate-600">{row.value}</Badge>
                                        </div>
                                    ))}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Recent notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {isLoading ? (
                                <div className="h-20 rounded bg-slate-100 animate-pulse" />
                            ) : recent.length === 0 ? (
                                <p className="text-sm text-slate-400 py-4 text-center">Inbox is empty.</p>
                            ) : (
                                recent.map((n) => (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            'rounded-lg border p-3 text-sm',
                                            n.seen ? 'border-slate-100 bg-white' : 'border-blue-100 bg-blue-50/50',
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <Badge variant="outline" className="text-[10px] uppercase">
                                                {typeLabel(n.type)}
                                            </Badge>
                                            <span className="text-[11px] text-slate-400">
                                                {new Date(n.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="mt-1 font-medium text-slate-800">
                                            {n.sender?.name ?? 'System'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Megaphone className="h-5 w-5 text-orange-500" /> Broadcast Composer
                            </CardTitle>
                            <CardDescription>Sends a live broadcast via POST /notifications/broadcast</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Message Title *</label>
                                    <Input
                                        placeholder="e.g. Summer Night Market is Live!"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Broadcast Type</label>
                                    <Select value={broadcastType} onValueChange={(v) => setBroadcastType(v as BroadcastType)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="broadcast_alert">Broadcast Alert</SelectItem>
                                            <SelectItem value="event_invite">Event Invite</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Message Body *</label>
                                <Textarea
                                    placeholder="Type your broadcast message here..."
                                    className="min-h-[120px] resize-none"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <p className="text-xs text-slate-400 text-right">{message.length} characters</p>
                            </div>

                            <div className="flex items-center justify-end pt-6 border-t border-slate-100">
                                <Button
                                    className="bg-orange-500 hover:bg-orange-600"
                                    disabled={!canSend}
                                    onClick={handleSend}
                                >
                                    {broadcast.isPending ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4 mr-2" />
                                    )}
                                    Send Broadcast
                                </Button>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Scheduling, drafts and audience segments are not
                                supported by the API yet — broadcasts send immediately to all recipients.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
