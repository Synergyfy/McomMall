'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Clock,
    Copy,
    Gift,
    Loader2,
    PoundSterling,
    Search,
    Ticket,
} from 'lucide-react';

import { RootState } from '@/service/store/store';
import { UserRole } from '@/service/auth/types';
import { useGetDeals } from '@/service/deals/hook';
import {
    useGetBusinessVoucherCoupons,
    useIssueVoucher,
} from '@/service/money-engine/hook';
import type { VoucherCouponStatus } from '@/service/money-engine/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const STATUS_FILTERS: Array<{ value: 'all' | VoucherCouponStatus; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'redeemed', label: 'Redeemed' },
    { value: 'expired', label: 'Expired' },
];

const STATUS_META: Record<
    VoucherCouponStatus,
    { label: string; className: string }
> = {
    active: {
        label: 'Active',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    redeemed: {
        label: 'Redeemed',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    expired: {
        label: 'Expired',
        className: 'bg-red-50 text-red-600 border-red-200',
    },
};

function money(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '—';
    }
    return `£${Number(value).toFixed(2)}`;
}

function formatDate(value: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function StatCard({
    title,
    value,
    hint,
    icon: Icon,
    tone = 'purple',
}: {
    title: string;
    value: string | number;
    hint?: string;
    icon: React.ElementType;
    tone?: 'purple' | 'emerald' | 'slate' | 'red' | 'orange';
}) {
    const tones: Record<string, string> = {
        purple: 'bg-purple-100 text-purple-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        slate: 'bg-slate-100 text-slate-600',
        red: 'bg-red-100 text-red-600',
        orange: 'bg-orange-100 text-orange-600',
    };
    return (
        <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 truncate">{value}</h3>
                    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
                </div>
                <div className={`p-3 rounded-2xl shrink-0 ${tones[tone]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function VoucherCouponsPage() {
    const { userRole } = useSelector((state: RootState) => state.auth);
    const isBusiness =
        userRole === UserRole.OWNER || userRole === UserRole.ADMIN;

    const [status, setStatus] = useState<'all' | VoucherCouponStatus>('all');
    const [search, setSearch] = useState('');
    const [issueOpen, setIssueOpen] = useState(false);
    const [issueTemplateId, setIssueTemplateId] = useState('');
    const [issueEmail, setIssueEmail] = useState('');
    const [issueExpiry, setIssueExpiry] = useState('');

    const { data, isLoading, isError, error } = useGetBusinessVoucherCoupons(
        { page: 1, limit: 100, status },
        isBusiness,
    );
    const { data: templateResponse } = useGetDeals(
        { page: 1, limit: 100, kind: 'voucher_coupon' },
        isBusiness,
    );
    const issueVoucher = useIssueVoucher();

    const templates = (templateResponse?.data ?? []).filter(
        (template) => !template.code,
    );

    const coupons = data?.data ?? [];
    const stats = data?.stats ?? {
        total: 0,
        active: 0,
        redeemed: 0,
        expired: 0,
        totalDiscountIssued: 0,
        totalDiscountRedeemed: 0,
    };

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return coupons;
        return coupons.filter((coupon) =>
            [
                coupon.code,
                coupon.templateName,
                coupon.description,
                coupon.recipientEmail,
                coupon.recipientName,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query)),
        );
    }, [coupons, search]);

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied');
    };

    const handleIssueVoucherCoupon = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await issueVoucher.mutateAsync({
                rewardDefinitionId: issueTemplateId,
                recipientEmail: issueEmail,
                expiresAt: issueExpiry || undefined,
            });
            toast.success('Voucher Coupon issued');
            setIssueOpen(false);
            setIssueEmail('');
            setIssueExpiry('');
            setIssueTemplateId('');
        } catch (error) {
            const message =
                (error as any)?.response?.data?.message ||
                (error as Error)?.message ||
                'Could not issue the Voucher Coupon';
            toast.error(Array.isArray(message) ? message.join('\n') : message);
        }
    };

    if (userRole && !isBusiness) {
        return (
            <Card className="border-dashed border-slate-200 bg-white/60">
                <CardContent className="py-16 text-center space-y-3">
                    <Ticket className="w-12 h-12 mx-auto text-slate-200" />
                    <h3 className="text-lg font-black text-slate-900">
                        Voucher Coupons are a business tool
                    </h3>
                    <p className="text-sm text-slate-500">
                        Switch to a business account to issue and track Voucher
                        Coupons.
                    </p>
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/dashboard/deals">Back to C-V / V-C</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="min-h-screen bg-transparent space-y-8 pb-10">
            <header className="space-y-3">
                <Link
                    href="/dashboard/deals/create"
                    className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-orange-600"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Manage C-V / V-C
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Ticket className="w-8 h-8 text-purple-600" />
                            Voucher Coupons
                        </h1>
                        <p className="text-gray-500 mt-1 max-w-2xl">
                            Single-use, scoped discounts you issue to customers.
                            They are applied as a discount at checkout — never as
                            spending money.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/dashboard/coupons-vouchers">
                                <Gift className="w-4 h-4 mr-2" />
                                Coupon Voucher hub
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                            onClick={() => setIssueOpen(true)}
                        >
                            <Ticket className="w-4 h-4 mr-2" />
                            Issue Voucher Coupon
                        </Button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <StatCard
                    title="Issued"
                    value={stats.total}
                    hint="Voucher Coupons created"
                    icon={Ticket}
                    tone="purple"
                />
                <StatCard
                    title="Active"
                    value={stats.active}
                    hint="Ready to redeem"
                    icon={BadgeCheck}
                    tone="emerald"
                />
                <StatCard
                    title="Redeemed"
                    value={stats.redeemed}
                    hint="Used by customers"
                    icon={BadgeCheck}
                    tone="slate"
                />
                <StatCard
                    title="Expired"
                    value={stats.expired}
                    hint="No longer redeemable"
                    icon={Clock}
                    tone="red"
                />
                <StatCard
                    title="Discount issued"
                    value={money(stats.totalDiscountIssued)}
                    hint="Total face value created"
                    icon={PoundSterling}
                    tone="orange"
                />
                <StatCard
                    title="Discount redeemed"
                    value={money(stats.totalDiscountRedeemed)}
                    hint="Value actually applied"
                    icon={PoundSterling}
                    tone="emerald"
                />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <Tabs
                    value={status}
                    onValueChange={(value) =>
                        setStatus(value as 'all' | VoucherCouponStatus)
                    }
                    className="w-full lg:w-auto"
                >
                    <TabsList className="bg-white/60 backdrop-blur-md p-1 rounded-xl shadow-inner border border-white/20 flex flex-wrap h-auto">
                        {STATUS_FILTERS.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div className="relative w-full lg:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search code, customer or template"
                        className="pl-9 rounded-xl bg-white"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="py-24 flex items-center justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading Voucher Coupons…
                </div>
            ) : isError ? (
                <Card className="border-dashed border-slate-200 bg-white/60">
                    <CardContent className="py-16 text-center space-y-3">
                        <Ticket className="w-12 h-12 mx-auto text-slate-200" />
                        <h3 className="text-lg font-black text-slate-900">
                            Voucher Coupon dashboard is not available yet
                        </h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            {(error as Error)?.message ||
                                'The Voucher Coupon dashboard is still rolling out.'}
                        </p>
                    </CardContent>
                </Card>
            ) : filtered.length === 0 ? (
                <Card className="border-dashed border-slate-200 bg-white/60">
                    <CardContent className="py-16 text-center space-y-3">
                        <Ticket className="w-12 h-12 mx-auto text-slate-200" />
                        <h3 className="text-lg font-black text-slate-900">
                            {coupons.length === 0
                                ? 'No Voucher Coupons issued yet'
                                : 'No Voucher Coupons match this view'}
                        </h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            {coupons.length === 0
                                ? 'Issue a scoped, single-use discount to a customer. They redeem it at checkout before shipping.'
                                : 'Try a different status tab or search term.'}
                        </p>
                        {coupons.length === 0 && (
                            <Button
                                type="button"
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                                onClick={() => setIssueOpen(true)}
                            >
                                <Ticket className="w-4 h-4 mr-2" />
                                Issue Voucher Coupon
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/70">
                                    <TableHead>Code</TableHead>
                                    <TableHead>Template</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Issued</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((coupon) => {
                                    const meta = STATUS_META[coupon.status];
                                    return (
                                        <TableRow key={coupon.id}>
                                            <TableCell>
                                                <button
                                                    type="button"
                                                    onClick={() => copyCode(coupon.code)}
                                                    className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-slate-700 hover:text-purple-600"
                                                    title="Copy code"
                                                >
                                                    {coupon.code}
                                                    <Copy className="w-3 h-3 text-slate-400" />
                                                </button>
                                            </TableCell>
                                            <TableCell className="max-w-[220px]">
                                                <p className="text-sm font-semibold text-slate-800 truncate">
                                                    {coupon.templateName || 'Voucher Coupon'}
                                                </p>
                                                <p className="text-[11px] text-slate-400 truncate">
                                                    {coupon.validShops.length > 0
                                                        ? coupon.validShops.join(', ')
                                                        : 'All shops'}
                                                </p>
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <p className="text-sm text-slate-700 truncate">
                                                    {coupon.recipientName ||
                                                        coupon.recipientEmail ||
                                                        '—'}
                                                </p>
                                                {coupon.recipientName &&
                                                    coupon.recipientEmail && (
                                                        <p className="text-[11px] text-slate-400 truncate">
                                                            {coupon.recipientEmail}
                                                        </p>
                                                    )}
                                            </TableCell>
                                            <TableCell className="text-sm font-bold text-slate-900 whitespace-nowrap">
                                                {money(coupon.faceValue)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`${meta.className} border font-semibold`}
                                                >
                                                    {meta.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                                {formatDate(coupon.expiresAt)}
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                                {formatDate(coupon.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            )}

            <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>Issue a Voucher Coupon</DialogTitle>
                        <DialogDescription>
                            Send a single-use, scoped discount to a customer. It
                            is applied as a discount, never as spending money.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleIssueVoucherCoupon}
                        className="space-y-4 py-2"
                    >
                        <div className="space-y-2">
                            <Label>Template</Label>
                            <select
                                value={issueTemplateId}
                                onChange={(event) =>
                                    setIssueTemplateId(event.target.value)
                                }
                                required
                                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                            >
                                <option value="">
                                    Select a Voucher Coupon template
                                </option>
                                {templates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.title}
                                        {template.faceValue
                                            ? ` — £${Number(template.faceValue).toFixed(2)}`
                                            : ''}
                                    </option>
                                ))}
                            </select>
                            {templates.length === 0 && (
                                <p className="text-xs text-amber-600">
                                    No Voucher Coupon templates are available.
                                    Ask an admin to create one.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Customer email</Label>
                            <Input
                                type="email"
                                value={issueEmail}
                                onChange={(event) =>
                                    setIssueEmail(event.target.value)
                                }
                                placeholder="customer@example.com"
                                required
                                className="rounded-xl"
                            />
                            <p className="text-[11px] text-slate-400">
                                The customer must already have an MCOM Mall
                                account.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Expires (optional)</Label>
                            <Input
                                type="datetime-local"
                                value={issueExpiry}
                                onChange={(event) =>
                                    setIssueExpiry(event.target.value)
                                }
                                className="rounded-xl"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={
                                issueVoucher.isPending ||
                                !issueTemplateId ||
                                !issueEmail
                            }
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                        >
                            {issueVoucher.isPending
                                ? 'Issuing…'
                                : 'Issue Voucher Coupon'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            <Card className="border border-purple-100 bg-purple-50/50 rounded-2xl">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">
                            Looking for spending-power wallets?
                        </span>{' '}
                        Coupon Vouchers live in the reward hub.
                    </div>
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/dashboard/coupons-vouchers">
                            Open Coupon Voucher hub
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
