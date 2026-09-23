'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Search, Store, Activity, ClipboardList, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useGetAdminAudits, useGetAdminAuditStats } from '@/service/audits/hook';
import type { StorefrontAudit } from '@/service/audits/types';

function scoreBadge(score: number) {
    return cn(
        score >= 80
            ? 'text-emerald-600 border-emerald-200'
            : score >= 60
              ? 'text-amber-600 border-amber-200'
              : 'text-red-600 border-red-200',
    );
}

function suggestionTitles(suggestions: StorefrontAudit['suggestions']): string[] {
    if (!Array.isArray(suggestions)) return [];
    return suggestions
        .map((s) => {
            if (typeof s === 'string') return s;
            if (s && typeof s === 'object' && 'title' in s) return String((s as { title: unknown }).title);
            return '';
        })
        .filter(Boolean);
}

export default function AuditsVisibilityPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState<StorefrontAudit | null>(null);

    const { data, isLoading, isError, error, refetch } = useGetAdminAudits();
    const { data: stats, isLoading: statsLoading } = useGetAdminAuditStats();

    const audits = useMemo(() => data ?? [], [data]);
    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return audits;
        return audits.filter(
            (a) =>
                (a.business?.businessName ?? '').toLowerCase().includes(q) ||
                a.type.toLowerCase().includes(q),
        );
    }, [audits, searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Audits &amp; Visibility</h1>
                    <p className="text-slate-500">Live storefront audits submitted by business owners</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Audits', value: stats?.total, icon: ClipboardList, tone: 'bg-indigo-100 text-indigo-600' },
                    { label: 'Avg Score', value: stats?.avgScore, icon: Activity, tone: 'bg-emerald-100 text-emerald-600' },
                    { label: 'Avg Storefront Score', value: stats?.avgStorefrontScore, icon: Store, tone: 'bg-blue-100 text-blue-600' },
                ].map((s) => (
                    <Card key={s.label} className="border-0 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={cn('p-3 rounded-xl', s.tone)}>
                                <s.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{statsLoading ? '…' : (s.value ?? '—')}</p>
                                <p className="text-sm text-slate-500 font-medium leading-tight">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-bold text-slate-500 mb-2">By Type</p>
                        {statsLoading ? (
                            <div className="h-6 rounded bg-slate-100 animate-pulse" />
                        ) : (stats?.byType.length ?? 0) === 0 ? (
                            <p className="text-sm text-slate-400">No audits yet.</p>
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                {(stats?.byType ?? []).map((t) => (
                                    <Badge key={t.type} variant="secondary" className="capitalize">
                                        {t.type}: {t.count}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load audits: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Business Audits</CardTitle>
                            <CardDescription>
                                {isLoading ? 'Loading…' : `${filtered.length} audits`}
                            </CardDescription>
                        </div>
                        <div className="w-64">
                            <Input
                                placeholder="Search businesses..."
                                className="h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-14 rounded bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="p-12 text-center text-sm text-slate-400">
                            No audits submitted yet. Owners submit audits from their dashboards.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead>Business</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Storefront</TableHead>
                                    <TableHead>Revenue Lift</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((audit) => {
                                    const titles = suggestionTitles(audit.suggestions);
                                    return (
                                        <TableRow key={audit.id}>
                                            <TableCell className="font-medium">
                                                {audit.business?.businessName ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {audit.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={scoreBadge(audit.score)}>
                                                    {audit.score}/100
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={scoreBadge(audit.storefrontScore)}>
                                                    {audit.storefrontScore}/100
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">£{Number(audit.revenueLift).toFixed(2)}</TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {audit.created_at ? new Date(audit.created_at).toLocaleDateString() : '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {titles.length > 0 ? (
                                                    <Button variant="ghost" size="sm" className="text-indigo-600" onClick={() => setSelected(audit)}>
                                                        {titles.length} suggestions
                                                    </Button>
                                                ) : (
                                                    <span className="flex items-center justify-end text-emerald-600 text-sm font-medium">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" /> All clear
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Audit Suggestions</SheetTitle>
                        <SheetDescription>
                            {selected?.business?.businessName} · Score {selected?.score}/100
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 space-y-3">
                        {selected && suggestionTitles(selected.suggestions).length === 0 && (
                            <p className="text-sm text-slate-400 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" /> No suggestions recorded for this audit.
                            </p>
                        )}
                        {selected &&
                            suggestionTitles(selected.suggestions).map((title, i) => (
                                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-medium text-slate-800">
                                    {title}
                                </div>
                            ))}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
