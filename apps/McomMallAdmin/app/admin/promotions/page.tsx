'use client';

import { useMemo, useState } from 'react';
import { Search, Tag, Users, CalendarClock, BadgeCheck, AlertTriangle, Trash2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useGetAdminPromotions, useDeletePromotion } from '@/service/promotions/hook';

function formatDate(value?: string): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

function isExpiringSoon(endDate?: string): boolean {
    if (!endDate) return false;
    const t = new Date(endDate).getTime();
    if (isNaN(t)) return false;
    const diff = t - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
}

export default function PromotionsManagementDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [scopeFilter, setScopeFilter] = useState('all');

    const { data, isLoading, isError, error, refetch } = useGetAdminPromotions();
    const deleteMutation = useDeletePromotion();

    const promotions = useMemo(() => data ?? [], [data]);
    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return promotions.filter((p) => {
            const matchesSearch =
                !q ||
                p.name.toLowerCase().includes(q) ||
                p.id.toLowerCase().includes(q) ||
                (p.businesses ?? []).some((b) =>
                    (b.businessName ?? '').toLowerCase().includes(q),
                ) ||
                (p.businessIds ?? []).some((id) => id.toLowerCase().includes(q));
            const matchesScope = scopeFilter === 'all' || p.promotionScope === scopeFilter;
            return matchesSearch && matchesScope;
        });
    }, [promotions, searchQuery, scopeFilter]);

    const activeCount = promotions.filter((p) => p.isActive).length;
    const participantCount = promotions.reduce((acc, p) => acc + (p.participants?.length ?? 0), 0);
    const expiringCount = promotions.filter((p) => isExpiringSoon(p.endDate)).length;

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Promotions</h1>
                <p className="text-sm font-bold text-slate-500 mt-1">
                    Live platform promotions from the API.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Promotions', value: promotions.length, icon: Tag },
                    { title: 'Active', value: activeCount, icon: BadgeCheck },
                    { title: 'Participants', value: participantCount, icon: Users },
                    { title: 'Expiring < 7 days', value: expiringCount, icon: CalendarClock },
                ].map((kpi) => (
                    <Card key={kpi.title} className="border-slate-200 shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                                <kpi.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.title}</p>
                                <p className="text-2xl font-black text-slate-900">{isLoading ? '…' : kpi.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <CardTitle>All Promotions</CardTitle>
                            <CardDescription>
                                {isLoading ? 'Loading…' : `${filtered.length} of ${promotions.length} shown`}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search name, business, ID…"
                                    className="pl-11 h-12 rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={scopeFilter} onValueChange={setScopeFilter}>
                                <SelectTrigger className="w-52 h-12 bg-white rounded-xl">
                                    <SelectValue placeholder="Scope" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All scopes</SelectItem>
                                    <SelectItem value="ALL_LISTINGS">All listings</SelectItem>
                                    <SelectItem value="SPECIFIC_LISTINGS">Specific listings</SelectItem>
                                    <SelectItem value="ALL_PRODUCTS">All products</SelectItem>
                                    <SelectItem value="SPECIFIC_PRODUCTS">Specific products</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
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
                            Failed to load promotions: {(error as Error)?.message ?? 'Unknown error'}
                            <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    )}
                    {!isLoading && !isError && filtered.length === 0 && (
                        <div className="p-12 text-center">
                            <Tag className="h-8 w-8 mx-auto text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">No promotions found</p>
                            <p className="text-sm text-slate-400">Try adjusting search or scope filter.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => {
                                    setSearchQuery('');
                                    setScopeFilter('all');
                                }}
                            >
                                Reset filters
                            </Button>
                        </div>
                    )}
                    {filtered.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30">
                                    <TableHead className="pl-8">Promotion</TableHead>
                                    <TableHead>Businesses</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Scope</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right pr-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="pl-8 py-4">
                                            <p className="text-sm font-black text-slate-900">{p.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">
                                                {p.id.slice(0, 8)}… · min spend £{p.minimumSpend}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-xs font-bold text-slate-600 max-w-48 truncate">
                                            {(p.businesses ?? []).length > 0
                                                ? p.businesses?.map((b) => b.businessName ?? b.id.slice(0, 8)).join(', ')
                                                : (p.businessIds ?? []).length > 0
                                                  ? `${p.businessIds?.length} businesses`
                                                  : 'Platform-wide'}
                                        </TableCell>
                                        <TableCell className="text-xs font-bold">
                                            <Badge variant="outline" className="capitalize">
                                                {p.promotionType.toLowerCase().replace(/_/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500">
                                            {p.promotionScope.replace(/_/g, ' ').toLowerCase()}
                                        </TableCell>
                                        <TableCell className="text-xs font-bold text-slate-600">
                                            {formatDate(p.beginDate)} → {formatDate(p.endDate)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                className={cn(
                                                    'border-none text-[10px] font-black uppercase',
                                                    p.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600',
                                                )}
                                            >
                                                {p.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={deleteMutation.isPending}
                                                onClick={() => {
                                                    if (confirm(`Delete promotion "${p.name}"?`)) {
                                                        deleteMutation.mutate(p.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-rose-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
