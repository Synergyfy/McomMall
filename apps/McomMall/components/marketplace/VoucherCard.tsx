'use client';

import Link from 'next/link';
import { Copy, Check, ShieldCheck, Tag, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromotionalItem } from '@/lib/listing-data';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CouponTicketSplit, CouponTicketFull } from '@/components/ui/CouponTicketCard';

interface VoucherCardProps {
    voucher: PromotionalItem;
    viewMode?: 'grid' | 'list';
    type?: 'vouchers' | 'coupons';
}

const VerticalRedRibbon = () => (
    <div className="absolute top-0 left-[-5%] bottom-0 w-3 z-20 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-red-500 via-red-600 to-red-800 shadow-[2px_0_10px_rgba(0,0,0,0.3)]" />
    </div>
);

const RedBow = () => (
    <div className="absolute top-1/2 left-[-5%] -translate-x-1/2 -translate-y-1/2 z-30 scale-[0.6] pointer-events-none">
        <div className="relative w-24 h-16 flex items-center justify-center">
            <div className="absolute -left-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-br from-red-500 to-red-900 rotate-[-15deg] shadow-lg" />
            <div className="absolute -right-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-bl from-red-500 to-red-900 rotate-[15deg] shadow-lg" />
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 border-2 border-red-500 z-10 shadow-xl" />
        </div>
    </div>
);

const VoucherWatermark = () => (
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
        <span className="text-[12rem] font-black uppercase rotate-[-15deg] select-none translate-x-12 translate-y-8 text-neutral-900">Voucher</span>
    </div>
);

export default function VoucherCard({ voucher, viewMode = 'grid', type = 'vouchers' }: VoucherCardProps) {
    const [copied, setCopied] = useState(false);

    const discountPercentage = voucher.discountedPrice
        ? Math.round(((voucher.price - voucher.discountedPrice) / voucher.price) * 100)
        : 0;

    const voucherCode = `SAVE${discountPercentage}`;
    const price = voucher.discountedPrice || voucher.price || 0;

    // Expiry calculation
    const getExpiryDisplay = () => {
        if (type === 'vouchers' && voucher.expiryDays) {
            return `${voucher.expiryDays} DAYS`;
        }

        if (type === 'coupons' && voucher.expiryDate) {
            const dateStr = String(voucher.expiryDate).trim();

            // Check if it's a numeric string (e.g. "22") indicating days from now
            if (/^\d+$/.test(dateStr)) {
                const days = parseInt(dateStr, 10);
                const date = new Date();
                date.setDate(date.getDate() + days);
                const formattedDate = date
                    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    .toUpperCase();
                return `${formattedDate} (${days} DAYS)`;
            }

            try {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    return date
                        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        .toUpperCase();
                }
            } catch (e) {
                // Return original string if it's not a valid date
                return dateStr.toUpperCase();
            }
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        return expiryDate
            .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            .toUpperCase();
    };

    const formattedExpiry = getExpiryDisplay();

    const handleCopyCode = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(voucherCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const faceValue = `£${Number(voucher.price || 0).toFixed(2)}`;
    const salePrice = `£${Number(voucher.discountedPrice || voucher.price || 0).toFixed(2)}`;
    const valueLabel = faceValue;

    // --- COUPON DESIGN (Keep as Ticket) ---
    if (type === 'coupons') {
        if (viewMode === 'list') {
            return (
                <Link href={voucher.link || `/coupons/${voucher.id}`} className="block">
                    <CouponTicketFull
                        title={voucher.title}
                        subtitle="Coupon Voucher"
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

        return (
            <Link href={voucher.link || `/coupons/${voucher.id}`} className="block h-full">
                <CouponTicketSplit
                    title={voucher.title}
                    subtitle="Coupon Voucher"
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

    // --- VOUCHER DESIGN (Dashboard Style) ---
    return (
        <Link href={voucher.link || `/vouchers/${voucher.id}`} className="block h-full">
            <motion.div
                whileHover={{ scale: 1.02 }}
                className={cn(
                    "group relative bg-white rounded-[2rem] shadow-lg overflow-hidden border border-gray-100 flex transition-all duration-300 hover:shadow-2xl",
                    viewMode === 'grid' ? "aspect-[1.58/1]" : "h-48"
                )}
            >
                {/* Left Section (Dark) */}
                <div className="w-[25%] bg-neutral-900 relative overflow-hidden flex flex-col items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent opacity-50" />

                    {/* Value Badge */}
                    <div className="relative z-40 bg-red-600 w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white/20 flex flex-col items-center justify-center shadow-2xl translate-x-4">
                        <span className="text-white text-[10px] md:text-xs font-black leading-none drop-shadow">{valueLabel}</span>
                    </div>

                    <div className="mt-auto relative z-40 translate-x-4 opacity-20">
                        <ShieldCheck className="text-white" size={20} />
                    </div>
                </div>

                {/* Right Section (Light) */}
                <div className="flex-1 bg-white relative p-4 md:p-8 pl-12 md:pl-16 flex flex-col justify-center">
                    <VoucherWatermark />
                    <VerticalRedRibbon />
                    <RedBow />

                    <div className="relative z-10 flex justify-between items-start mb-2">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 line-clamp-1">
                                    {voucher.title}
                                </span>
                            </div>
                        </div>
                        <Sparkles className="text-yellow-500 opacity-40" size={16} />
                    </div>

                    <div className="relative z-10 mt-1 mb-2">
                        <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-1">VOUCHER</h2>
                        <p className="text-[8px] md:text-[10px] text-gray-500 font-medium leading-relaxed max-w-[200px] line-clamp-2">
                            Official marketplace voucher for premium services and exclusive products.
                        </p>
                    </div>

                    <div className="relative z-10 mt-2 flex items-center justify-between">
                        <div className="px-3 py-1 md:px-6 md:py-2 border-2 border-gray-900 rounded-full">
                            <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-gray-900">MCOMMALL</span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyCode}
                            className="h-8 md:h-10 rounded-xl border-red-100 hover:border-red-600 hover:text-red-600 font-bold text-[10px] px-3 transition-colors"
                        >
                            {copied ? <Check size={14} className="mr-1" /> : <Tag size={14} className="mr-1" />}
                            {copied ? 'COPIED' : `BUY FOR ${salePrice}`}
                        </Button>
                    </div>

                </div>

                {/* Expiry Badge - Moved to main container for global positioning */}
                <div className="absolute bottom-4 right-4 z-40">
                    <div className="bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 flex items-center gap-1 shadow-sm">
                        <Clock size={10} className="text-orange-600" />
                        <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest leading-none">
                            {formattedExpiry}
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

// Utility for VoucherCard
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
