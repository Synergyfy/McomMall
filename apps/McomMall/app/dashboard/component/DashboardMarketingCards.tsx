'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Gift, Ticket, Sparkles, Tag, Zap, Timer, ShieldCheck, Pencil, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CURRENCY, stripHtmlText } from '@/lib/utils';
import { DiscountType } from '@/service/coupons/types';

// --- Gift Card Dashboard Component ---
interface GiftCardProps {
    template: {
        id: string;
        name: string;
        description?: string;
        backgroundImageUrl?: string | null;
        isActive: boolean;
        fixedAmounts?: number[];
        bonusAmount?: number;
    };
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const GoldenRibbon = () => (
    <div className="absolute bottom-[28%] left-0 w-full h-5 z-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-[0_2px_8px_rgba(0,0,0,0.3)] opacity-90" />
    </div>
);

const GoldenBow = () => (
    <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 -translate-y-[calc(50%-2px)] z-20 scale-[0.45] pointer-events-none">
        <div className="relative">
            {/* Bow Tails */}
            <div className="absolute top-8 -left-8 w-10 h-16 bg-gradient-to-b from-yellow-600 to-yellow-800 shadow-xl skew-x-[-15deg]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)' }} />
            <div className="absolute top-8 -right-8 w-10 h-16 bg-gradient-to-b from-yellow-600 to-yellow-800 shadow-xl skew-x-[15deg]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)' }} />

            {/* Main Bow Loops */}
            <div className="absolute -left-12 top-0 w-24 h-16 border-[5px] border-yellow-500/30 rounded-[2.5rem] bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 rotate-[-15deg] shadow-[0_10px_20px_rgba(0,0,0,0.3)]" />
            <div className="absolute -right-12 top-0 w-24 h-16 border-[5px] border-yellow-500/30 rounded-[2.5rem] bg-gradient-to-bl from-yellow-300 via-yellow-500 to-yellow-700 rotate-[15deg] shadow-[0_10px_20px_rgba(0,0,0,0.3)]" />

            {/* Center Knot */}
            <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 rounded-full shadow-2xl z-10 border-2 border-yellow-400" />
        </div>
    </div>
);

const PinstripePattern = () => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-20 pointer-events-none">
        <defs>
            <pattern id="pinstripe-dash" patternUnits="userSpaceOnUse" width="100%" height="4">
                <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pinstripe-dash)" />
    </svg>
);

export const DashboardGiftCard: React.FC<GiftCardProps> = ({ template, onEdit, onDelete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative aspect-[1.58/1] w-full max-w-[340px] mx-auto"
        >
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white/10 bg-white">
                <Image
                    src={template.backgroundImageUrl || 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80'}
                    alt={template.name}
                    fill
                    className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" />
                <PinstripePattern />

                <GoldenRibbon />
                <GoldenBow />

                <div className="absolute top-4 left-4 w-8 h-6 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-md opacity-80 border border-white/30 z-30" />
                <ShieldCheck className="absolute top-4 right-4 text-white/50 z-30" size={16} />

                <div className="absolute top-6 inset-x-6 z-30">
                    <div className="space-y-1">
                        <h4 className="text-yellow-400 font-black text-2xl tracking-tighter drop-shadow-2xl uppercase italic leading-none">
                            GIFT CARD
                        </h4>
                        <p className="text-white font-bold text-[9px] max-w-[180px] leading-tight opacity-90">
                            {template.description || 'Premium gift card template for your business services.'}
                        </p>
                        <p className="text-white/40 text-[7px] font-black uppercase tracking-[0.2em] mt-1">
                            TEMPLATE • {template.name}
                        </p>
                    </div>
                </div>

                <div className="absolute inset-x-8 bottom-6 z-30">
                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <h3 className="text-xl font-black text-white tracking-tight drop-shadow-md">{template.name}</h3>
                            <p className="text-white/50 text-[9px] font-bold uppercase tracking-[0.2em]">Ready to use</p>
                        </div>
                        <div className="text-right">
                            <Sparkles className="text-yellow-400 mb-2 ml-auto drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={24} />
                        </div>
                    </div>
                </div>

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Button
                        onClick={() => onEdit(template.id)}
                        variant="secondary"
                        className="rounded-full bg-white hover:bg-orange-500 hover:text-white"
                    >
                        <Pencil size={18} className="mr-2" /> Edit
                    </Button>
                    <Button
                        onClick={() => onDelete(template.id)}
                        variant="destructive"
                        className="rounded-full"
                    >
                        <Trash2 size={18} className="mr-2" /> Delete
                    </Button>
                </div>

                <Badge className={`absolute top-4 right-14 ${template.isActive ? 'bg-green-500' : 'bg-red-500'} group-hover:opacity-0 transition-opacity`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                </Badge>
            </div>
        </motion.div>
    );
};

const VerticalRedRibbon = () => (
    <div className="absolute top-0 left-[25%] bottom-0 w-3 z-20 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-red-500 via-red-600 to-red-800 shadow-[2px_0_10px_rgba(0,0,0,0.3)]" />
    </div>
);

const RedBow = () => (
    <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 z-30 scale-75 pointer-events-none">
        <div className="relative w-24 h-16 flex items-center justify-center">
            {/* Bow Loops */}
            <div className="absolute -left-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-br from-red-500 to-red-900 rotate-[-15deg] shadow-lg" />
            <div className="absolute -right-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-bl from-red-500 to-red-900 rotate-[15deg] shadow-lg" />
            {/* Bow Knot */}
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 border-2 border-red-500 z-10 shadow-xl" />
            {/* Bow Tails */}
            <div className="absolute top-8 -left-3 w-8 h-10 bg-red-700 rounded-bl-3xl rotate-[-20deg] opacity-90" />
            <div className="absolute top-8 -right-3 w-8 h-10 bg-red-700 rounded-br-3xl rotate-[20deg] opacity-90" />
        </div>
    </div>
);

const VoucherWatermark = () => (
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
        <span className="text-[12rem] font-black uppercase rotate-[-15deg] select-none translate-x-12 translate-y-8">Gift</span>
    </div>
);

interface VoucherProps {
    product: {
        id: string;
        name?: string;
        description?: string;
        fixedAmounts?: number[];
        allowCustomAmount?: boolean;
        minCustomAmount?: number | string | null;
        bonusAmount?: number | string | null;
        isEnabled?: boolean;
        expiryDays?: number | null;
    };
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export const DashboardVoucher: React.FC<VoucherProps> = ({ product, onEdit, onDelete }) => {
    // Helper to determine price display
    const getPriceDisplay = () => {
        if (product.fixedAmounts && product.fixedAmounts.length > 0) {
            const minPrice = Math.min(...product.fixedAmounts);
            return `${CURRENCY}${minPrice}`;
        }
        if (product.allowCustomAmount && product.minCustomAmount) {
            return `From ${CURRENCY}${Number(product.minCustomAmount).toFixed(2)}`;
        }
        if (product.allowCustomAmount) {
            return 'Custom Amount';
        }
        return `${CURRENCY}0`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative aspect-[1.58/1]"
        >
            <div className="absolute inset-0 bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 flex">
                {/* Left Section (Dark) */}
                <div className="w-[25%] bg-neutral-900 relative overflow-hidden flex flex-col items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent opacity-50" />

                    {/* Value Badge on Ribbon Area */}
                    <div className="relative z-40 bg-red-600 w-16 h-16 rounded-full border-4 border-white/20 flex flex-col items-center justify-center shadow-2xl mb-8 translate-x-4">
                        <span className="text-white text-xs font-black leading-none drop-shadow">{getPriceDisplay()}</span>
                    </div>

                    <div className="mt-auto relative z-40 translate-x-4">
                        <ShieldCheck className="text-white/20" size={20} />
                    </div>
                </div>

                {/* Right Section (Light) */}
                <div className="flex-1 bg-white relative p-8 pl-16 flex flex-col">
                    <VoucherWatermark />
                    <VerticalRedRibbon />
                    <RedBow />

                    <div className="relative z-10 flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">
                                    {product.name || 'Voucher Name'}
                                </span>
                            </div>
                            <p className="text-[8px] text-gray-400 font-bold tracking-widest uppercase">Digital Marketing</p>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-50 text-gray-400">
                            <Tag size={18} />
                        </div>
                    </div>

                    <div className="relative z-10 mt-2 mb-4">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-2">VOUCHER</h2>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed max-w-[200px]">
                            {stripHtmlText(product.description) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna.'}
                        </p>
                    </div>

                    <div className="relative z-10 mt-auto flex items-center justify-between">
                        <div className="px-6 py-2 border-2 border-gray-900 rounded-full">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">{product.name || 'Voucher Name'}</span>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(product.id)}
                                className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <Pencil size={18} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(product.id)}
                                className="h-10 w-10 p-0 rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors"
                            >
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bonus Badge */}
                {product.bonusAmount && (
                    <div className="absolute top-4 right-4 z-40">
                        <Badge className="bg-green-500 hover:bg-green-600 text-[9px] font-black px-3 py-1 shadow-lg border-2 border-white/20">
                            +{CURRENCY}{Number(product.bonusAmount).toFixed(2)} BONUS
                        </Badge>
                    </div>
                )}

                {/* Status & Expiry Badge */}
                <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end gap-2">
                    {product.expiryDays && (
                        <div className="bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 flex items-center gap-1 shadow-sm">
                            <Clock size={10} className="text-orange-600" />
                            <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest leading-none">
                                {product.expiryDays} Days
                            </span>
                        </div>
                    )}
                    <div className={`w-2 h-2 rounded-full ${product.isEnabled ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(34,197,94,0.5)]`} />
                </div>
            </div>
        </motion.div>
    );
};

// --- Coupon Dashboard Component ---
interface CouponProps {
    coupon: {
        id: string;
        code?: string;
        title?: string;
        description?: string;
        discountValue: string | number;
        discountType: string;
        status?: string;
        expiresAt?: string | null;
    };
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export const DashboardCoupon: React.FC<CouponProps> = ({ coupon, onEdit, onDelete }) => {
    const isPercentage = coupon.discountType === DiscountType.PERCENTAGE;
    const displayValue = isPercentage
        ? `${coupon.discountValue}%`
        : `${CURRENCY}${Number(coupon.discountValue).toFixed(2)}`;
    const status = (coupon.status || 'active').toLowerCase();

    const statusConfig: Record<string, { label: string; badge: string; dot: string }> = {
        active: { label: 'Active', badge: 'bg-emerald-400/15 text-emerald-200 border-emerald-400/40', dot: 'bg-emerald-400' },
        draft: { label: 'Draft', badge: 'bg-slate-400/15 text-slate-200 border-slate-400/40', dot: 'bg-slate-400' },
        scheduled: { label: 'Scheduled', badge: 'bg-sky-400/15 text-sky-200 border-sky-400/40', dot: 'bg-sky-400' },
        expired: { label: 'Expired', badge: 'bg-rose-400/15 text-rose-200 border-rose-400/40', dot: 'bg-rose-400' },
        redeemed: { label: 'Redeemed', badge: 'bg-violet-400/15 text-violet-200 border-violet-400/40', dot: 'bg-violet-400' },
        archived: { label: 'Archived', badge: 'bg-zinc-400/15 text-zinc-200 border-zinc-400/40', dot: 'bg-zinc-400' },
        disabled: { label: 'Disabled', badge: 'bg-red-400/15 text-red-200 border-red-400/40', dot: 'bg-red-400' },
    };
    const statusInfo = statusConfig[status] ?? statusConfig.active;

    const expiryText = coupon.expiresAt
        ? new Date(coupon.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className="group relative aspect-[1.58/1] w-full max-w-[380px] mx-auto"
        >
            <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-br from-[#1c1917] via-[#431407] to-[#f58220] shadow-2xl shadow-orange-950/30 overflow-hidden">
                <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-orange-400/25 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.07] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                        backgroundSize: '18px 18px',
                    }}
                />

                <div className="relative h-full flex flex-col justify-between p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${statusInfo.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot} shadow-[0_0_6px_rgba(255,255,255,0.4)]`} />
                            {statusInfo.label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/80">
                            <Zap size={10} className="text-yellow-300" />
                            {isPercentage ? 'Percentage' : 'Fixed'}
                        </span>
                    </div>

                    <div className="text-center">
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/50 mb-1">
                            Save up to
                        </p>
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                                {displayValue}
                            </span>
                            <span className="text-2xl font-black text-yellow-300 drop-shadow">OFF</span>
                        </div>
                        <p className="mt-2 truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                            {coupon.title || 'Special Offer'}
                        </p>
                    </div>

                    <div className="relative">
                        <div className="border-t-2 border-dashed border-white/25" />
                        <div className="absolute -left-5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-slate-50" />
                        <div className="absolute -right-5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-slate-50" />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/50">Code</p>
                            <p className="truncate font-mono text-sm font-bold tracking-[0.15em] text-white">
                                {coupon.code || '—'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {expiryText && (
                                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-semibold text-white/70">
                                    <Timer size={10} />
                                    {expiryText}
                                </span>
                            )}
                            <Button
                                onClick={() => onEdit(coupon.id)}
                                aria-label="Edit coupon"
                                className="h-9 w-9 p-0 rounded-xl bg-white/15 text-white hover:bg-white hover:text-orange-600 backdrop-blur-md border border-white/20 transition-colors"
                            >
                                <Pencil size={14} />
                            </Button>
                            <Button
                                onClick={() => onDelete(coupon.id)}
                                aria-label="Delete coupon"
                                className="h-9 w-9 p-0 rounded-xl bg-red-500/70 text-white hover:bg-red-600 backdrop-blur-md border border-white/10 transition-colors"
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
