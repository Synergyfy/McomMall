'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
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
    ShieldAlert,
    MessageSquareX,
    UserX,
    Search,
    AlertTriangle,
    CheckCircle2,
    Scale,
    Star,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useGetDisputeStats, useGetAllDisputes, useResolveDispute } from '@/service/dispute/hook';
import { useGetAdminReviews, usePublishReview, useUnpublishReview } from '@/service/reviews/hook';
import { useGetAdminUsers } from '@/service/admin/hook';
import { useGetVerificationStats } from '@/service/verifications/hook';

export default function CompliancePage() {
    const [searchQuery, setSearchQuery] = useState('');

    const { data: disputeStats } = useGetDisputeStats();
    const {
        data: disputesData,
        isLoading: disputesLoading,
        isError: disputesError,
        error: disputesErr,
        refetch: refetchDisputes,
    } = useGetAllDisputes({ search: searchQuery || undefined, page: 1, limit: 20 });
    const resolveDispute = useResolveDispute();

    const { data: reviewsData } = useGetAdminReviews(1, 20);
    const publishReview = usePublishReview();
    const unpublishReview = useUnpublishReview();

    const { data: suspendedData } = useGetAdminUsers({ status: 'suspended', limit: 1 });
    const { data: verificationStats } = useGetVerificationStats();

    const disputes = useMemo(() => {
        const list = disputesData?.data ?? [];
        return list.filter((d) => d.status !== 'resolved');
    }, [disputesData]);

    const pendingReviews = useMemo(() => {
        const arr = reviewsData?.data ?? [];
        return arr.filter((r) => String(r.status).toLowerCase() === 'pending');
    }, [reviewsData]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Moderation &amp; Compliance</h1>
                    <p className="text-slate-500">Live integrity signals aggregated from disputes, reviews, users and verifications</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search disputes..."
                        className="pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Open Disputes', value: disputeStats?.open, icon: Scale, tone: 'bg-red-100 text-red-600', border: 'border-t-red-500' },
                    { label: 'Escalated', value: disputeStats?.escalated, icon: ShieldAlert, tone: 'bg-orange-100 text-orange-600', border: 'border-t-orange-500' },
                    { label: 'Reviews Pending', value: pendingReviews.length, icon: MessageSquareX, tone: 'bg-purple-100 text-purple-600', border: 'border-t-purple-500' },
                    { label: 'Suspended Accounts', value: suspendedData?.total, icon: UserX, tone: 'bg-slate-200 text-slate-800', border: 'border-t-slate-800' },
                ].map((s) => (
                    <Card key={s.label} className={cn('border-0 shadow-sm border-t-4', s.border)}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={cn('p-3 rounded-xl', s.tone)}>
                                <s.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{s.value ?? '…'}</p>
                                <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {disputesError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load disputes: {(disputesErr as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetchDisputes()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" /> Open Disputes
                        </CardTitle>
                        <CardDescription>Resolve directly or open the full disputes queue</CardDescription>
                    </div>
                    <Link href="/admin/disputes">
                        <Button variant="outline" size="sm">Full queue</Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    {disputesLoading ? (
                        <div className="p-6 space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-14 rounded bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : disputes.length === 0 ? (
                        <p className="p-8 text-center text-sm text-slate-400">No open disputes. All clear.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Customer → Business</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {disputes.slice(0, 8).map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell>
                                            <p className="font-medium text-slate-900 capitalize">{d.reason.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-slate-400 truncate max-w-64">{d.description}</p>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {d.customerName} <span className="text-slate-400">→</span> {d.businessName}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">£{Number(d.amount).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {d.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-emerald-600"
                                                disabled={resolveDispute.isPending}
                                                onClick={() => resolveDispute.mutate(d.id)}
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-amber-500" /> Reviews Awaiting Moderation
                        </CardTitle>
                        <CardDescription>Publish or unpublish flagged reviews</CardDescription>
                    </div>
                    <Link href="/admin/reviews">
                        <Button variant="outline" size="sm">All reviews</Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    {pendingReviews.length === 0 ? (
                        <p className="p-8 text-center text-sm text-slate-400">No pending reviews.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead>Review</TableHead>
                                    <TableHead className="text-center">Rating</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingReviews.slice(0, 8).map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell className="max-w-md truncate">{review.comment ?? '—'}</TableCell>
                                        <TableCell className="text-center font-bold">{review.rating ?? '—'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-emerald-600"
                                                    onClick={() => publishReview.mutate(review.id)}
                                                >
                                                    Publish
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() => unpublishReview.mutate(review.id)}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <p className="text-xs text-slate-400">
                Pending identity/business checks live under{' '}
                <Link href="/admin/verifications" className="font-bold text-blue-600">
                    Verifications
                </Link>{' '}
                ({verificationStats?.pending ?? '…'} pending).
            </p>
        </div>
    );
}
