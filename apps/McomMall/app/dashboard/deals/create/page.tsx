'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, Gift, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RootState } from '@/service/store/store';
import { UserRole } from '@/service/auth/types';

const OFFER_TYPES = [
    {
        key: 'coupon_voucher',
        title: 'Coupon Voucher',
        description:
            'Looks like a coupon, creates spending power. Templates are defined by the platform; here you can view the active ones, issue cashback and redeem spending power.',
        cta: 'Manage Coupon Vouchers',
        href: '/dashboard/coupons-vouchers',
        icon: Gift,
        accent: 'bg-orange-50 text-orange-700',
    },
    {
        key: 'voucher_coupon',
        title: 'Voucher Coupon',
        description:
            'Looks like a voucher, behaves like a coupon. A scoped, single-use discount entitlement that a business can issue to a customer.',
        cta: 'Manage Voucher Coupon',
        href: '/dashboard/voucher-coupons',
        icon: Sparkles,
        accent: 'bg-purple-50 text-purple-700',
    },
];

export default function ManageDealPage() {
    const router = useRouter();
    const { userRole } = useSelector((state: RootState) => state.auth);
    const isBusiness =
        userRole === UserRole.OWNER || userRole === UserRole.ADMIN;

    useEffect(() => {
        if (userRole && !isBusiness) {
            router.replace('/dashboard');
        }
    }, [userRole, isBusiness, router]);

    if (!isBusiness) return null;

    return (
        <div className="min-h-screen bg-transparent space-y-8 pb-10">
            <header className="space-y-2">
                <Link
                    href="/dashboard/deals"
                    className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-orange-600"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to C-V / V-C
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Manage C-V / V-C</h1>
                <p className="text-gray-500">
                    Coupon Voucher templates are created by the platform, not by
                    a business. From here you can manage the Coupon Vouchers
                    your shops accept, or issue a Voucher Coupon discount to a
                    customer.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
