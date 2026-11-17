'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
    Copy,
    Gift,
    Loader2,
    PlusCircle,
    Search,
    Ticket,
    Wallet,
} from 'lucide-react';

import { RootState } from '@/service/store/store';
import { UserRole } from '@/service/auth/types';
import { useGetDeals, useGetMyDeals } from '@/service/deals/hook';
import { Deal, DealKind } from '@/service/deals/types';
import { useIssueVoucher } from '@/service/money-engine/hook';
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
import { ContributeModal } from './components/ContributeModal';

const KIND_META: Record<
    DealKind,
    { label: string; className: string; icon: React.ElementType }
> = {
    standard_coupon: {
        label: 'Standard Coupon',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Ticket,
    },
    coupon_voucher: {
        label: 'Coupon Voucher',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: Gift,
    },
    voucher_coupon: {
        label: 'Voucher Coupon',
        className: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Ticket,
    },
    voucher: {
        label: 'Voucher',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Wallet,
    },
    gift_card: {
        label: 'Gift Card',
        className: 'bg-pink-50 text-pink-700 border-pink-200',
        icon: Gift,
    },
    promotion: {
        label: 'Promotion',
        className: 'bg-slate-50 text-slate-700 border-slate-200',
        icon: Gift,
    },
};

const TABS: Array<{ value: 'all' | DealKind; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'standard_coupon', label: 'Standard Coupons' },
    { value: 'coupon_voucher', label: 'Coupon Vouchers' },
    { value: 'voucher_coupon', label: 'Voucher Coupons' },
    { value: 'gift_card', label: 'Gift Cards' },
    { value: 'promotion', label: 'Promotions' },
];

function money(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '—';
    }
    return `£${Number(value).toFixed(2)}`;
}

function valueLabel(deal: Deal): string {
    if (
        (deal.kind === 'standard_coupon' || deal.kind === 'voucher_coupon') &&
        deal.faceValue !== null
    ) {
        return deal.discountType === 'percentage'
            ? `${deal.faceValue}% off`
            : `${money(deal.faceValue)} off`;
    }
    if (deal.remainingValue !== null) {
        return `${money(deal.remainingValue)} available`;
    }
    if (deal.faceValue !== null) {
        return money(deal.faceValue);
    }
    return '—';
}

function DealCard({
    deal,
    onContribute,
}: {
    deal: Deal;
    onContribute: (deal: Deal) => void;
}) {
    const meta = KIND_META[deal.kind] ?? KIND_META.standard_coupon;
    const Icon = meta.icon;
    const isUsable = Boolean(deal.code) && deal.kind !== 'promotion';

    const copyCode = () => {
        if (!deal.code) return;
        navigator.clipboard.writeText(deal.code);
        toast.success('Code copied');
    };

    return (
        <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <Badge className={`${meta.className} border font-semibold`}>
                        <Icon className="w-3.5 h-3.5 mr-1" />
                        {meta.label}
                    </Badge>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {deal.status}
                    </span>
                </div>

                <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {deal.title}
                    </h3>
                    {deal.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {deal.description}
                        </p>
                    )}
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {deal.kind === 'standard_coupon' ||
                        deal.kind === 'voucher_coupon'
                            ? 'Discount'
                            : 'Spending power'}
                    </p>
                    <p className="text-2xl font-black text-slate-900">
                        {valueLabel(deal)}
                    </p>
                    {deal.faceValue !== null && deal.remainingValue !== null && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Worth {money(deal.faceValue)}
                        </p>
                    )}
                </div>

                {deal.code && (
                    <button
                        type="button"
                        onClick={copyCode}
                        className="w-full flex items-center justify-between gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-left hover:border-orange-300 transition-colors"
                    >
                        <span className="font-mono text-sm font-bold tracking-wider text-slate-700">
                            {deal.code}
                        </span>
                        <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-600 truncate">
                            {deal.businessName ?? 'MCOM Mall'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                            {deal.expiresAt
                                ? `Expires ${new Date(deal.expiresAt).toLocaleDateString()}`
                                : 'No expiry'}
                        </p>
                    </div>
                    {isUsable && (
                        <div className="flex items-center gap-2">
                            {deal.kind === 'coupon_voucher' &&
                                deal.code &&
                                (deal.contributionRemaining === null ||
                                    deal.contributionRemaining ===
                                        undefined ||
                                    deal.contributionRemaining > 0) && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={() => onContribute(deal)}
                                    >
                                        Top up
                                    </Button>
                                )}
                            <Button
                                asChild
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                            >
                                <Link
                                    href={
                                        deal.kind === 'coupon_voucher' && deal.code
                                            ? `/checkout?moneyVoucherCode=${encodeURIComponent(deal.code)}`
                                            : deal.kind === 'voucher_coupon' && deal.code
                                              ? `/checkout?priceReducerCode=${encodeURIComponent(deal.code)}`
                                              : '/checkout'
                                    }
                                >
                                    Use
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function DealsPage() {
    const { userRole } = useSelector((state: RootState) => state.auth);
    const isBusiness = userRole === UserRole.OWNER || userRole === UserRole.ADMIN;
    const [activeTab, setActiveTab] = useState<'all' | DealKind>('all');
    const [search, setSearch] = useState('');
    const [contributeDeal, setContributeDeal] = useState<Deal | null>(null);
    const [issueOpen, setIssueOpen] = useState(false);
    const [issueTemplateId, setIssueTemplateId] = useState('');
    const [issueEmail, setIssueEmail] = useState('');
    const [issueExpiry, setIssueExpiry] = useState('');

    const { data, isLoading, isError, error } = useGetMyDeals({
        page: 1,
        limit: 100,
    });
    const { data: templateResponse } = useGetDeals(
        { page: 1, limit: 100, kind: 'voucher_coupon' },
        isBusiness,
    );
    const issueVoucher = useIssueVoucher();

    const deals = data?.data ?? [];
    const voucherCouponTemplates = (templateResponse?.data ?? []).filter(
        (template) => !template.code,
    );

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

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return deals.filter((deal) => {
            if (activeTab !== 'all' && deal.kind !== activeTab) return false;
            if (!query) return true;
            return [deal.title, deal.description, deal.code, deal.businessName]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });
    }, [deals, activeTab, search]);

    return (
        <div className="min-h-screen bg-transparent space-y-8 pb-10">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Gift className="w-8 h-8 text-orange-600" />
                        Deals
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Coupons, vouchers and spending power in one place.
                    </p>
                </div>
                {isBusiness && (
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setIssueOpen(true)}
                        >
                            <Ticket className="w-4 h-4 mr-2" />
                            Issue Voucher Coupon
                        </Button>
                        <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
                            <Link href="/dashboard/deals/create">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Create offer
                            </Link>
                        </Button>
                    </div>
                )}
            </header>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as 'all' | DealKind)}
                    className="w-full lg:w-auto"
                >
                    <TabsList className="bg-white/60 backdrop-blur-md p-1 rounded-xl shadow-inner border border-white/20 flex flex-wrap h-auto">
                        {TABS.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white text-xs"
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
                        placeholder="Search deals"
                        className="pl-9 rounded-xl bg-white"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="py-24 flex items-center justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading deals…
                </div>
            ) : isError ? (
                <Card className="border-dashed border-slate-200 bg-white/60">
                    <CardContent className="py-16 text-center space-y-3">
                        <Gift className="w-12 h-12 mx-auto text-slate-200" />
                        <h3 className="text-lg font-black text-slate-900">
                            Deals hub is not available yet
                        </h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            {(error as Error)?.message ||
                                'The deals hub is still rolling out. Your existing coupons and vouchers are available in the reward hub.'}
                        </p>
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/dashboard/coupons-vouchers">Open reward hub</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : filtered.length === 0 ? (
                <Card className="border-dashed border-slate-200 bg-white/60">
                    <CardContent className="py-20 text-center space-y-3">
                        <Search className="w-12 h-12 mx-auto text-slate-200" />
                        <h3 className="text-lg font-black text-slate-900">
                            No deals found
                        </h3>
                        <p className="text-sm text-slate-500">
                            {deals.length === 0
                                ? 'Save a coupon or buy a voucher and it will appear here.'
                                : 'Try a different tab or search term.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((deal) => (
                        <DealCard
                            key={`${deal.source}:${deal.id}`}
                            deal={deal}
                            onContribute={setContributeDeal}
                        />
                    ))}
                </div>
            )}

            <ContributeModal
                deal={contributeDeal}
                open={Boolean(contributeDeal)}
                onOpenChange={(open) => {
                    if (!open) setContributeDeal(null);
                }}
            />

            {isBusiness && (
                <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
                    <DialogContent className="sm:max-w-[460px]">
                        <DialogHeader>
                            <DialogTitle>Issue a Voucher Coupon</DialogTitle>
                            <DialogDescription>
                                Send a single-use, scoped discount to a customer.
                                It is applied as a discount, never as spending
                                money.
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
                                    {voucherCouponTemplates.map((template) => (
                                        <option
                                            key={template.id}
                                            value={template.id}
                                        >
                                            {template.title}
                                            {template.faceValue
                                                ? ` — £${Number(template.faceValue).toFixed(2)}`
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                                {voucherCouponTemplates.length === 0 && (
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
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                            >
                                {issueVoucher.isPending
                                    ? 'Issuing…'
                                    : 'Issue Voucher Coupon'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
