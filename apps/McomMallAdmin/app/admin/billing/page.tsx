'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Wallet,
    TrendingUp,
    CreditCard,
    ArrowDownRight,
    Search,
    RefreshCw,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetAdminTransactions, useGetAdminTransactionStats } from '@/service/admin/hook';
import type { AdminTransactionType } from '@/service/admin/types';

const PAGE_SIZE = 10;

type BillingTab = 'all' | AdminTransactionType;

function statusStyle(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('success') || s.includes('complet') || s.includes('paid')) {
        return 'text-emerald-600 border-emerald-200 bg-emerald-50';
    }
    if (s.includes('fail') || s.includes('reject') || s.includes('cancel')) {
        return 'text-red-600 border-red-200 bg-red-50';
    }
    if (s.includes('pend') || s.includes('process')) {
        return 'text-blue-600 border-blue-200 bg-blue-50';
    }
    return 'text-slate-600 border-slate-200 bg-slate-50';
}

export default function BillingPage() {
    const [tab, setTab] = useState<BillingTab>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data: stats, isLoading: statsLoading } = useGetAdminTransactionStats();
    const { data, isLoading, isError, error, refetch } = useGetAdminTransactions({
        search: debouncedSearch || undefined,
        type: tab === 'all' ? undefined : tab,
        page,
        limit: PAGE_SIZE,
    });

    const transactions = data?.data ?? [];
    const totalPages = data?.totalPages ?? 1;
    const total = data?.total ?? 0;

    const onSearch = (value: string) => {
        setSearchQuery(value);
        setPage(1);
        window.clearTimeout((window as unknown as { __bs?: number }).__bs);
        (window as unknown as { __bs?: number }).__bs = window.setTimeout(
            () => setDebouncedSearch(value.trim()),
            400,
        );
    };

    const switchTab = (value: string) => {
        setTab(value as BillingTab);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Billing &amp; Financial Oversight</h1>
                    <p className="text-slate-500">Live transaction volume, fees, payouts, and refunds from the API</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-10 bg-white"
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Volume', value: stats ? `£${Number(stats.totalVolume).toLocaleString()}` : undefined, icon: Wallet, tone: 'bg-emerald-100 text-emerald-600' },
                    { title: 'Total Fees', value: stats ? `£${Number(stats.totalFees).toLocaleString()}` : undefined, icon: TrendingUp, tone: 'bg-blue-100 text-blue-600' },
                    { title: 'Pending', value: stats?.pendingCount, icon: CreditCard, tone: 'bg-amber-100 text-amber-600' },
                    { title: 'Refunds', value: stats?.refundCount, icon: RefreshCw, tone: 'bg-rose-100 text-rose-600' },
                ].map((kpi) => (
                    <Card key={kpi.title} className="border-0 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg', kpi.tone)}>
                                <kpi.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {statsLoading ? '…' : (kpi.value ?? '—')}
                                </p>
                                <p className="text-xs text-slate-500">{kpi.title}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load transactions: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Tabs value={tab} onValueChange={switchTab} className="w-full">
                <TabsList className="bg-slate-100 p-1 gap-1">
                    <TabsTrigger value="all">All Transactions</TabsTrigger>
                    <TabsTrigger value="payment">Payments</TabsTrigger>
                    <TabsTrigger value="payout">Payouts</TabsTrigger>
                    <TabsTrigger value="refund">Refunds</TabsTrigger>
                </TabsList>

                <TabsContent value={tab} className="mt-6">
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="capitalize">
                                {tab === 'all' ? 'Recent Transactions' : `${tab}s`}
                            </CardTitle>
                            <CardDescription>
                                {isLoading ? 'Loading…' : `${total} transactions found`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 relative">
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                </div>
                            )}
                            {!isLoading && !isError && transactions.length === 0 && (
                                <div className="p-12 text-center">
                                    <Wallet className="h-8 w-8 mx-auto text-slate-300" />
                                    <p className="mt-3 font-bold text-slate-700">No transactions found</p>
                                    <p className="text-sm text-slate-400">Try adjusting your search.</p>
                                </div>
                            )}
                            {transactions.length > 0 && (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead>Transaction ID</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Payer → Payee</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead className="text-right">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((txn) => (
                                                <TableRow key={txn.id}>
                                                    <TableCell className="font-mono text-xs text-slate-500">
                                                        {txn.id.slice(0, 8)}
                                                        <div className="text-[11px] text-slate-400">{txn.paymentMethod}</div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-600">
                                                        {new Date(txn.date).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-900">
                                                        {txn.payerName}
                                                        <span className="text-slate-400"> → </span>
                                                        {txn.payeeName}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {txn.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell
                                                        className={cn(
                                                            'font-semibold',
                                                            txn.type === 'refund' ? 'text-rose-600' : 'text-slate-900',
                                                        )}
                                                    >
                                                        {txn.type === 'refund' ? '−' : ''}£
                                                        {Number(txn.amount).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="outline" className={cn(statusStyle(txn.status))}>
                                                            {txn.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                                            <p className="text-xs font-bold text-slate-500">
                                                Page {page} of {totalPages} · {total} total
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
                </TabsContent>
            </Tabs>

            <p className="text-xs text-slate-400 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" /> Payout approvals and invoicing are not exposed by the API
                yet — this view is read-only until payout endpoints land.
            </p>
        </div>
    );
}
