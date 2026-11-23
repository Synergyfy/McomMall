'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
    Copy,
    Gift,
    HelpCircle,
    Loader2,
    Search,
    Settings2,
    Ticket,
} from 'lucide-react';

import { RootState } from '@/service/store/store';
import { UserRole } from '@/service/auth/types';
import { useGetDeals, useGetMyDeals } from '@/service/deals/hook';
import { Deal } from '@/service/deals/types';
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

const MANAGED_KINDS = ['coupon_voucher', 'voucher_coupon'] as const;
type ManagedDealKind = (typeof MANAGED_KINDS)[number];

const KIND_META: Record<
    ManagedDealKind,
    { label: string; className: string; icon: React.ElementType }
> = {
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
};

const TABS: Array<{ value: 'all' | ManagedDealKind; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'coupon_voucher', label: 'Coupon Vouchers' },
    { value: 'voucher_coupon', label: 'Voucher Coupons' },
];

function money(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '—';
    }
    return `£${Number(value).toFixed(2)}`;
}

function valueLabel(deal: Deal): string {
    if (deal.kind === 'voucher_coupon' && deal.faceValue !== null) {
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
    const meta =
        KIND_META[deal.kind as ManagedDealKind] ?? KIND_META.coupon_voucher;
    const Icon = meta.icon;
    const isUsable = Boolean(deal.code);

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
                        {deal.kind === 'voucher_coupon'
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
    const [activeTab, setActiveTab] = useState<'all' | ManagedDealKind>('all');
    const [search, setSearch] = useState('');
    const [contributeDeal, setContributeDeal] = useState<Deal | null>(null);
    const [issueOpen, setIssueOpen] = useState(false);
    const [learnOpen, setLearnOpen] = useState(false);
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

    const deals = useMemo(
        () =>
            (data?.data ?? []).filter((deal) =>
                (MANAGED_KINDS as readonly string[]).includes(deal.kind),
            ),
        [data],
    );
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
                        Coupon Voucher / Voucher Coupon
                    </h1>
                    <p className="text-gray-500 mt-1">
                        <span className="font-semibold text-slate-700">
                            C-V / V-C
                        </span>{' '}
                        — spendable value and single-use discounts in one place.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3 rounded-xl"
                        onClick={() => setLearnOpen(true)}
                    >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Learn more
                    </Button>
                </div>
                {isBusiness && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setIssueOpen(true)}
                        >
                            <Ticket className="w-4 h-4 mr-2" />
                            Issue Voucher Coupon
                        </Button>
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/dashboard/voucher-coupons">
                                <Ticket className="w-4 h-4 mr-2" />
                                Voucher Coupons dashboard
                            </Link>
                        </Button>
                        <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
                            <Link href="/dashboard/deals/create">
                                <Settings2 className="w-4 h-4 mr-2" />
                                Manage C-V / V-C
                            </Link>
                        </Button>
                    </div>
                )}
            </header>

            <Dialog open={learnOpen} onOpenChange={setLearnOpen}>
                <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            How Coupon Vouchers and Voucher Coupons work
                        </DialogTitle>
                        <DialogDescription>
                            Both are stored on the same wallet ledger, but they
                            do opposite jobs. A Coupon Voucher creates
                            money-like spending power inside MCOM Mall; a
                            Voucher Coupon only takes an agreed amount off a
                            bill. The visual name says how it looks — the
                            functional type is what the system actually
                            enforces.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <Card className="border border-orange-100 bg-white rounded-2xl shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <Badge className="bg-orange-50 text-orange-700 border-orange-200 border font-semibold">
                                <Gift className="w-3.5 h-3.5 mr-1" />
                                Coupon Voucher · Spending power
                            </Badge>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-slate-900">
                                    Looks like a coupon. Behaves like a voucher
                                    wallet.
                                </h3>
                                <p className="text-sm text-slate-500">
                                    It puts value in. The customer ends up with
                                    more spending power than the real money they
                                    paid.
                                </p>
                            </div>
                            <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
                                <li>
                                    <span className="font-semibold text-slate-800">
                                        Creates a balance:
                                    </span>{' '}
                                    the face value is split into a real-money
                                    part and a reward part. A £100 Coupon
                                    Voucher might be £50 paid by the customer +
                                    £50 added by the campaign.
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">
                                        Full value is displayed:
                                    </span>{' '}
                                    the customer sees the full £100 spendable
                                    balance; the real/reward split stays
                                    internal.
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">
                                        It is a wallet, not a ticket:
                                    </span>{' '}
                                    the balance goes down as it is spent,
                                    partial spending is allowed, and any
                                    remainder stays available until it expires
                                    or reaches zero.
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">
                                        It can be funded over time:
                                    </span>{' '}
                                    the customer pays the real-money share, or
                                    friends and family top it up until the
                                    real-money target is reached.
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">
                                        Used as payment, not a discount:
                                    </span>{' '}
                                    at checkout or POS it is applied as a
                                    payment instrument, only inside the closed
                                    MCOM network — it cannot be withdrawn as
                                    cash.
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">
                                        Templates are platform-defined:
                                    </span>{' '}
                                    businesses and campaigns issue it against an
                                    admin-defined template so the split, scope
                                    and cashback cap stay consistent.
                                </li>
                            </ul>
                            <p className="text-xs font-semibold text-orange-700 bg-orange-50 rounded-xl px-3 py-2">
                                Best for: cashback-style rewards, campaigns,
                                gifting, and keeping spend circulating with
                                nearby businesses.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-purple-100 bg-white rounded-2xl shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 border font-semibold">
                                <Ticket className="w-3.5 h-3.5 mr-1" />
                                Voucher Coupon · Discount
                            </Badge>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-slate-900">
                                    Looks like a voucher. Behaves like a
                                    coupon.
                                </h3>
                                <p className="text-sm text-slate-500">
                                    It takes value off. It never adds a balance,
                                    so it cannot be spent as money.
                                </p>
                            </div>
                            <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
                                <li>
                                    <span className="font-semibold text-slate-800">
                                        A discount, not money:
                                    </span>{' '}
                                    it adds nothing to the wallet; it reduces
                                    the amount due by its agreed face value.
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">
                                        Single use:
                                    </span>{' '}
                                    it is applied once, in the discount slot at
                                    checkout or POS, before shipping — then it
                                    is consumed.
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">
                                        Scoped:
                                    </span>{' '}
                                    it only works for the shops, products,
                                    services or campaign it was issued for, and
                                    only until its expiry date.
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">
                                        Locked down:
                                    </span>{' '}
                                    it is non-transferable, non-reloadable, and
                                    cannot be used as a general payment
                                    instrument.
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">
                                        Issued, not bought:
                                    </span>{' '}
                                    a business or admin sends it to a customer&apos;s
                                    email; it is not purchased like a voucher.
                                </li>
                                <li>
                                    <span className="font-semibold text-slate-800">
                                        Margin-safe:
                                    </span>{' '}
                                    the business gives only the agreed
                                    reduction, with no ongoing balance
                                    liability.
                                </li>
                            </ul>
                            <p className="text-xs font-semibold text-purple-700 bg-purple-50 rounded-xl px-3 py-2">
                                Best for: targeted discounts, win-back offers,
                                and campaign-specific promotions.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">
                        Rule of thumb:
                    </span>{' '}
                    if it puts value into the wallet, it is a Coupon Voucher.
                    If it takes value off the bill, it is a Voucher Coupon.
                </p>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <Tabs
                    value={activeTab}
                    onValueChange={(value) =>
                        setActiveTab(value as 'all' | ManagedDealKind)
                    }
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
                        placeholder="Search C-V / V-C"
                        className="pl-9 rounded-xl bg-white"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="py-24 flex items-center justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading coupons and vouchers…
                </div>
            ) : isError ? (
                <Card className="border-dashed border-slate-200 bg-white/60">
                    <CardContent className="py-16 text-center space-y-3">
                        <Gift className="w-12 h-12 mx-auto text-slate-200" />
                        <h3 className="text-lg font-black text-slate-900">
                            C-V / V-C hub is not available yet
                        </h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            {(error as Error)?.message ||
                                'The Coupon Voucher / Voucher Coupon hub is still rolling out.'}
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
                            No coupon vouchers or voucher coupons found
                        </h3>
                        <p className="text-sm text-slate-500">
                            {deals.length === 0
                                ? isBusiness
                                    ? 'You have no Coupon Vouchers or Voucher Coupons yet. Issue a Voucher Coupon to a customer, or manage the Coupon Vouchers your shops accept in the Reward Hub.'
                                    : 'Buy or receive a Coupon Voucher, or ask a business to issue you a Voucher Coupon, and it will appear here.'
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
