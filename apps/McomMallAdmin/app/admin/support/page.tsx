'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import {
    LifeBuoy,
    Search,
    MessageCircle,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    XCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    useGetSupportTickets,
    useGetSupportTicket,
    useAddTicketMessage,
    useResolveTicket,
    useCloseTicket,
} from '@/service/support/hook';
import type { SupportTicket } from '@/service/support/types';

function displayName(user: SupportTicket['user']): string {
    if (!user) return 'Unknown user';
    return user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || user.id.slice(0, 8);
}

function statusStyle(status: string): string {
    switch (status) {
        case 'OPEN':
            return 'bg-blue-100 text-blue-700';
        case 'IN_PROGRESS':
            return 'bg-indigo-100 text-indigo-700';
        case 'RESOLVED':
            return 'bg-emerald-100 text-emerald-700';
        case 'CLOSED':
            return 'bg-slate-200 text-slate-600';
        default:
            return 'bg-slate-100 text-slate-600';
    }
}

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data, isLoading, isError, error, refetch } = useGetSupportTickets();
    const resolve = useResolveTicket();
    const close = useCloseTicket();

    const tickets = useMemo(() => data ?? [], [data]);
    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return tickets.filter((t) => {
            const matchesSearch =
                !q ||
                t.subject.toLowerCase().includes(q) ||
                t.id.toLowerCase().includes(q) ||
                displayName(t.user).toLowerCase().includes(q);
            const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tickets, searchQuery, statusFilter]);

    const counts = useMemo(
        () => ({
            open: tickets.filter((t) => t.status === 'OPEN').length,
            inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
            resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
            closed: tickets.filter((t) => t.status === 'CLOSED').length,
        }),
        [tickets],
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Support &amp; Resolution Center</h1>
                    <p className="text-slate-500">Live support tickets from the API</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search subject, ID or user..."
                            className="pl-9 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 bg-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Open Tickets', value: counts.open },
                    { label: 'In Progress', value: counts.inProgress },
                    { label: 'Resolved', value: counts.resolved },
                    { label: 'Closed', value: counts.closed },
                ].map((s) => (
                    <Card key={s.label} className="border-0 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                                <LifeBuoy className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{isLoading ? '…' : s.value}</p>
                                <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50">
                    <CardTitle className="text-lg">Support Queue</CardTitle>
                    <CardDescription>
                        {isLoading ? 'Loading…' : `${filtered.length} of ${tickets.length} tickets shown`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading && (
                        <div className="p-6 space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-14 rounded bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    )}
                    {isError && (
                        <div className="p-6 flex items-center gap-3 text-sm text-rose-700 bg-rose-50">
                            <AlertTriangle className="h-4 w-4" />
                            Failed to load tickets: {(error as Error)?.message ?? 'Unknown error'}
                            <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    )}
                    {!isLoading && !isError && filtered.length === 0 && (
                        <div className="p-12 text-center">
                            <LifeBuoy className="h-8 w-8 mx-auto text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">No tickets found</p>
                            <p className="text-sm text-slate-400">Try adjusting search or status filter.</p>
                        </div>
                    )}
                    {filtered.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="w-[120px]">Ticket ID</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-center">Messages</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((t) => (
                                    <TableRow key={t.id} className="cursor-pointer hover:bg-slate-50/50" onClick={() => setSelectedId(t.id)}>
                                        <TableCell className="font-mono text-xs text-slate-500 font-medium">
                                            #{t.id.slice(0, 8)}
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-900 max-w-72 truncate">{t.subject}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-[10px] bg-slate-200 text-slate-600">
                                                        {displayName(t.user).slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium text-slate-700">{displayName(t.user)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{t.messages?.length ?? 0}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={cn(statusStyle(t.status))}>
                                                {t.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedId(t.id)}>
                                                    <MessageCircle className="h-4 w-4 mr-1" /> Open
                                                </Button>
                                                {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-emerald-600"
                                                        disabled={resolve.isPending}
                                                        onClick={() => resolve.mutate(t.id)}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
                                                    </Button>
                                                )}
                                                {t.status !== 'CLOSED' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-slate-500"
                                                        disabled={close.isPending}
                                                        onClick={() => close.mutate(t.id)}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" /> Close
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Ticket details</SheetTitle>
                        <SheetDescription>Conversation and resolution actions.</SheetDescription>
                    </SheetHeader>
                    {selectedId && <TicketDetailBody id={selectedId} />}
                </SheetContent>
            </Sheet>
        </div>
    );
}

function TicketDetailBody({ id }: { id: string }) {
    const { data, isLoading, isError, error } = useGetSupportTicket(id);
    const reply = useAddTicketMessage(id);
    const [message, setMessage] = useState('');

    if (isLoading) return <div className="mt-4 h-40 rounded-xl bg-slate-100 animate-pulse" />;
    if (isError || !data)
        return <p className="mt-4 text-sm text-rose-600">Failed to load: {(error as Error)?.message ?? 'Not found'}</p>;

    return (
        <div className="mt-4 space-y-4">
            <div>
                <p className="font-bold text-slate-900">{data.subject}</p>
                <p className="text-sm text-slate-600 mt-1">{data.description}</p>
                <Badge variant="secondary" className={cn('mt-2', statusStyle(data.status))}>
                    {data.status.replace(/_/g, ' ')}
                </Badge>
            </div>
            <div className="space-y-3 border-t border-slate-100 pt-4">
                {(data.messages ?? []).length === 0 && (
                    <p className="text-sm text-slate-400">No messages yet.</p>
                )}
                {(data.messages ?? []).map((m) => (
                    <div key={m.id} className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-500">
                            {displayName(m.user)} · {new Date(m.created_at ?? m.createdAt ?? '').toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-800 mt-1">{m.message}</p>
                    </div>
                ))}
            </div>
            {(data.status === 'OPEN' || data.status === 'IN_PROGRESS') && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                    <Textarea
                        placeholder="Write a staff reply..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button
                        disabled={!message.trim() || reply.isPending}
                        onClick={() => reply.mutate(message.trim(), { onSuccess: () => setMessage('') })}
                    >
                        {reply.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Send reply
                    </Button>
                </div>
            )}
        </div>
    );
}
