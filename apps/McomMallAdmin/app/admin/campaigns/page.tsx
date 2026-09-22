'use client';

import { useMemo, useState } from 'react';
import { Search, Megaphone, Eye, Trash2, AlertTriangle, Loader2, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useGetMarketingCampaigns, useGetMarketingCampaign } from '@/service/campaigns/hook';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/service/api';

const PAGE_SIZE = 10;

function statusStyle(status: string): string {
    switch (status) {
        case 'ACTIVE':
            return 'bg-emerald-500 text-white';
        case 'SCHEDULED':
            return 'bg-blue-500 text-white';
        case 'PAUSED':
            return 'bg-amber-500 text-white';
        case 'ENDED':
            return 'bg-slate-400 text-white';
        default:
            return 'bg-slate-200 text-slate-600';
    }
}

function formatDate(value: string): string {
    const d = new Date(value);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export default function CampaignManagementDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [detailId, setDetailId] = useState<string | null>(null);

    const { data, isLoading, isError, error, refetch } = useGetMarketingCampaigns({
        page,
        limit: PAGE_SIZE,
    });

    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/campaigns/marketing/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['FETCH_MARKETING_CAMPAIGNS'] });
            toast.success('Campaign deleted');
        },
        onError: (e: unknown) => {
            const message =
                (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'Failed to delete campaign';
            toast.error(message);
        },
    });

    const campaigns = useMemo(() => data?.data ?? [], [data]);
    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return campaigns.filter((c) => {
            const matchesSearch =
                !q ||
                c.name.toLowerCase().includes(q) ||
                c.type.toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q);
            const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [campaigns, searchQuery, statusFilter]);

    const totalPages = data?.meta.totalPages ?? 1;
    const totalItems = data?.meta.totalItems ?? 0;

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Campaign Management</h1>
                    <p className="text-sm font-bold text-slate-500 mt-1">
                        Live platform marketing campaigns from the API.
                    </p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">Marketing Campaigns</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 mt-1">
                                {isLoading ? 'Loading campaigns…' : `${totalItems} campaigns total`}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search name, type, or ID…"
                                    className="pl-11 h-12 text-sm font-bold border-slate-200 bg-white rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={(v) => {
                                    setStatusFilter(v);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-44 h-12 bg-white rounded-xl">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="PAUSED">Paused</SelectItem>
                                    <SelectItem value="ENDED">Ended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 relative">
                    {isLoading && (
                        <div className="p-6 space-y-3">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    )}
                    {isError && (
                        <div className="p-6 flex items-center gap-3 text-sm text-rose-700 bg-rose-50">
                            <AlertTriangle className="h-4 w-4" />
                            Failed to load campaigns: {(error as Error)?.message ?? 'Unknown error'}
                            <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    )}
                    {!isLoading && !isError && filtered.length === 0 && (
                        <div className="p-12 text-center">
                            <Megaphone className="h-8 w-8 mx-auto text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">No campaigns found</p>
                            <p className="text-sm text-slate-400">Try adjusting search or status filter.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                    setPage(1);
                                }}
                            >
                                Reset filters
                            </Button>
                        </div>
                    )}
                    {filtered.length > 0 && (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/30">
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-14">
                                            Campaign
                                        </TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">
                                            Type
                                        </TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">
                                            Status
                                        </TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">
                                            Schedule
                                        </TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">
                                            Coupons
                                        </TableHead>
                                        <TableHead className="text-right pr-8 h-14" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((c) => (
                                        <TableRow key={c.id} className="hover:bg-slate-50/50">
                                            <TableCell className="pl-8 py-5">
                                                <p className="text-sm font-black text-slate-900">{c.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                                    {c.id.slice(0, 8)}…
                                                    {c.season ? ` · ${c.season.name}` : ''}
                                                </p>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 capitalize">
                                                    <Tag className="h-3.5 w-3.5 text-slate-400" />
                                                    {c.type.toLowerCase()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <Badge className={cn('text-[9px] font-black uppercase tracking-widest border-none px-3 py-1', statusStyle(c.status))}>
                                                    {c.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-5 text-xs font-bold text-slate-600">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                    {formatDate(c.startDate)} → {formatDate(c.endDate)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center py-5 font-black text-sm text-slate-800">
                                                {c.coupons?.length ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-right pr-8 py-5">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => setDetailId(c.id)}>
                                                        <Eye className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={deleteMutation.isPending}
                                                        onClick={() => {
                                                            if (confirm(`Delete campaign "${c.name}"?`)) {
                                                                deleteMutation.mutate(c.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-rose-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-8 py-4 border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-500">
                                        Page {page} of {totalPages} · {totalItems} total
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page >= totalPages}
                                            onClick={() => setPage((p) => p + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Campaign details</DialogTitle>
                        <DialogDescription>Live record from the API.</DialogDescription>
                    </DialogHeader>
                    {detailId && <CampaignDetailBody id={detailId} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CampaignDetailBody({ id }: { id: string }) {
    const { data, isLoading, isError, error } = useGetMarketingCampaign(id);
    if (isLoading) return <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />;
    if (isError || !data)
        return <p className="text-sm text-rose-600">Failed to load: {(error as Error)?.message ?? 'Not found'}</p>;
    return (
        <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Name</dt><dd className="font-black">{data.name}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Type</dt><dd className="capitalize">{data.type.toLowerCase()}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Status</dt><dd><Badge className={cn('border-none', statusStyle(data.status))}>{data.status}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Start</dt><dd>{formatDate(data.startDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 font-bold">End</dt><dd>{formatDate(data.endDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Season</dt><dd>{data.season?.name ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 font-bold">Coupons</dt><dd>{data.coupons?.length ?? 0}</dd></div>
            {(data.targetPostalCodes?.length ?? 0) > 0 && (
                <div className="flex justify-between"><dt className="text-slate-500 font-bold">Postcodes</dt><dd>{data.targetPostalCodes?.join(', ')}</dd></div>
            )}
        </dl>
    );
}
