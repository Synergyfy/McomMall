'use client';

import Link from 'next/link';
import { Copy, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromotionalItem } from '@/lib/listing-data';
import { useState } from 'react';
import { CouponTicketSplit, CouponTicketFull } from '@/components/ui/CouponTicketCard';

interface VoucherCardProps {
    voucher: PromotionalItem;
    viewMode?: 'grid' | 'list';
}

export default function VoucherCard({ voucher, viewMode = 'grid' }: VoucherCardProps) {
    const [copied, setCopied] = useState(false);

    const discountPercentage = voucher.discountedPrice
        ? Math.round(((voucher.price - voucher.discountedPrice) / voucher.price) * 100)
        : 0;

    const voucherCode = `SAVE${discountPercentage}`;
    const price = voucher.discountedPrice || voucher.price || 0;

    // Expiry date — 30 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const formattedExpiry = expiryDate
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        .toUpperCase();

    const handleCopyCode = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(voucherCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const valueLabel = discountPercentage > 0 ? `${discountPercentage}%` : `£${Number(price).toFixed(0)}`;

    if (viewMode === 'list') {
        return (
            <Link href={voucher.link || `/vouchers/${voucher.id}`} className="block">
                <CouponTicketFull
                    title={voucher.title}
                    subtitle="Gift Voucher"
                    valueLabel={valueLabel}
                    validUntil={formattedExpiry}
                    footerText="mcommall.com"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCode}
                        className="rounded-xl border-blue-200 hover:border-[#2563eb] hover:text-[#2563eb] font-bold text-xs h-9 px-4"
                    >
                        {copied ? <><Check size={12} className="mr-1" /> COPIED!</> : <><Copy size={12} className="mr-1" /> COPY CODE</>}
                    </Button>
                </CouponTicketFull>
            </Link>
        );
    }

    // Grid View
    return (
        <Link href={voucher.link || `/vouchers/${voucher.id}`} className="block h-full">
            <CouponTicketSplit
                title={voucher.title}
                subtitle="Gift Voucher"
                valueLabel={valueLabel}
                validUntil={formattedExpiry}
                footerText="mcommall.com"
                barcodeId={voucherCode}
                showStars
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="w-full rounded-xl border-blue-200 hover:border-[#2563eb] hover:text-[#2563eb] font-bold text-xs h-9"
                >
                    {copied ? 'COPIED!' : `CODE: ${voucherCode}`}
                </Button>
            </CouponTicketSplit>
        </Link>
    );
}
