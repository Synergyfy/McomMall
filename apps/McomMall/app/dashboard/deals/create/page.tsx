'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Gift, Sparkles, Ticket } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OFFER_TYPES = [
    {
        key: 'standard_coupon',
        title: 'Standard Coupon',
        description:
            'A normal discount: £5 off, 10% off or a scoped promotion. It reduces the price at checkout.',
        cta: 'Create coupon',
        href: '/dashboard/coupons/new',
        icon: Ticket,
        accent: 'bg-blue-50 text-blue-700',
    },
    {
        key: 'coupon_voucher',
        title: 'Coupon Voucher',
        description:
            'Looks like a coupon, creates spending power. Customers pay a real-money share and receive a larger voucher balance.',
        cta: 'View Coupon Vouchers',
        href: '/dashboard/coupons-vouchers',
        icon: Gift,
        accent: 'bg-orange-50 text-orange-700',
    },
    {
        key: 'voucher_coupon',
        title: 'Voucher Coupon',
        description:
            'Looks like a voucher, behaves like a coupon. A scoped, single-use discount entitlement on the wallet ledger.',
        cta: 'Issue Voucher Coupon',
        href: '/dashboard/deals?tab=voucher_coupon',
        icon: Sparkles,
        accent: 'bg-purple-50 text-purple-700',
    },
];

export default function CreateDealPage() {
    return (
        <div className="min-h-screen bg-transparent space-y-8 pb-10">
            <header className="space-y-2">
                <Link
                    href="/dashboard/deals"
                    className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-orange-600"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Deals
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Create an offer</h1>
                <p className="text-gray-500">
                    Choose what the offer should do. The name is only presentation; the
                    behaviour is what the system enforces.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {OFFER_TYPES.map((offer) => {
                    const Icon = offer.icon;
                    return (
                        <Card
                            key={offer.key}
                            className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden flex flex-col"
                        >
                            <CardContent className="p-6 space-y-4 flex flex-col flex-1">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${offer.accent}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h2 className="text-xl font-black text-slate-900">
                                        {offer.title}
                                    </h2>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {offer.description}
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                                >
                                    <Link href={offer.href}>
                                        {offer.cta}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card className="border-dashed border-slate-200 bg-white/60">
                <CardContent className="p-6 text-sm text-slate-500">
                    Coupon Voucher and Voucher Coupon templates are defined by the platform so
                    the real/reward split, scope and cashback cap stay consistent across the
                    network. Browse the active templates, or contact support to request a new
                    campaign.
                </CardContent>
            </Card>
        </div>
    );
}
