'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Gift, Ticket, Sparkles, Tag, Zap, Timer, ShieldCheck, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CURRENCY } from '@/lib/utils';

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
    <div className="absolute bottom-[28%] left-0 w-full h-2 z-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-md" />
    </div>
);

const GoldenBow = () => (
    <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 -translate-y-[calc(50%-4px)] z-20 scale-[0.5] pointer-events-none">
        <div className="relative w-16 h-10 flex items-center justify-center">
            <div className="absolute -left-1.5 w-8 h-8 border-2 border-yellow-500 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 rotate-[-15deg] shadow-sm" />
            <div className="absolute -right-1.5 w-8 h-8 border-2 border-yellow-500 rounded-full bg-gradient-to-bl from-amber-400 to-yellow-600 rotate-[15deg] shadow-sm" />
            <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 border border-yellow-200 z-10 shadow-md" />
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
            className="group relative aspect-[1.58/1] w-full"
        >
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white/10 bg-white">
                <Image
                    src={template.backgroundImageUrl || 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80'}
                    alt={template.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" />
                <PinstripePattern />

                <GoldenRibbon />
                <GoldenBow />

                <div className="absolute top-4 left-4 w-8 h-6 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-md opacity-80 border border-white/30 z-30" />
                <ShieldCheck className="absolute top-4 right-4 text-white/50 z-30" size={16} />

                <div className="absolute inset-x-6 top-8 z-30">
                    <h4 className="text-2xl font-black text-yellow-500 italic drop-shadow-lg leading-none">
                        GIFT <span className="text-yellow-400">CARD</span>
                    </h4>
                    <p className="text-[7px] text-white/60 font-bold uppercase tracking-widest mt-1">Official Template</p>
                </div>

                <div className="absolute inset-x-6 bottom-6 z-30">
                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <h3 className="text-xl font-black text-white tracking-tight drop-shadow-md">{template.name}</h3>
                            <p className="text-white/70 text-[9px] font-bold uppercase tracking-[0.2em]">{template.description || 'Premium Gift Experience'}</p>
                        </div>
                        <div className="text-right">
                            <div className="bg-white/95 p-1 rounded-lg inline-block shadow-lg">
                                <div className="w-10 h-10 border-2 border-gray-100 rounded flex items-center justify-center text-gray-400">
                                    <Sparkles size={20} />
                                </div>
                            </div>
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
                <div className="flex-1 bg-white relative p-8 flex flex-col">
                    <VoucherWatermark />
                    <VerticalRedRibbon />
                    <RedBow />

                    <div className="relative z-10 flex justify-between items-start mb-4">
                        <div className="pl-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">
                                    YOUR COMPANY NAME
                                </span>
                            </div>
                            <p className="text-[8px] text-gray-400 font-bold tracking-widest pl-6 uppercase">Digital Marketing</p>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-50 text-gray-400">
                            <Tag size={18} />
                        </div>
                    </div>

                    <div className="relative z-10 pl-4 mt-2 mb-4">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-2">VOUCHER</h2>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed max-w-[200px]">
                            {product.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna.'}
                        </p>
                    </div>

                    <div className="relative z-10 pl-4 mt-auto flex items-center justify-between">
                        <div className="px-6 py-2 border-2 border-gray-900 rounded-full">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">YOUR COMPANY NAME</span>
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

                {/* Status Badge */}
                <div className="absolute bottom-4 right-4 z-40">
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
        couponCode?: string;
        name?: string;
        couponAmount: string | number;
        discountType: string;
        isActive?: boolean;
    };
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export const DashboardCoupon: React.FC<CouponProps> = ({ coupon, onEdit, onDelete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative aspect-[1.58/1]"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-700 rounded-[2rem] p-6 shadow-xl border border-white/10 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />

                <div className="flex justify-between items-start">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20">
                        <div className="flex items-center gap-2">
                            <Zap className="text-yellow-400 fill-yellow-400" size={14} />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Dashboard Preview</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/60 text-[9px] font-black uppercase tracking-tighter">
                        <Timer size={12} /> {coupon.discountType}
                    </div>
                </div>

                <div className="text-center py-2">
                    <h3 className="text-2xl font-black text-white leading-tight">
                        {coupon.couponCode || coupon.name || 'Flash Coupon'}
                    </h3>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Value: {CURRENCY}{coupon.couponAmount}</p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white">
                            <Sparkles size={16} />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => onEdit(coupon.id)}
                            className="h-10 w-10 p-0 bg-white/20 text-white hover:bg-white hover:text-orange-600 rounded-xl backdrop-blur-md border border-white/20"
                        >
                            <Pencil size={16} />
                        </Button>
                        <Button
                            onClick={() => onDelete(coupon.id)}
                            className="h-10 w-10 p-0 bg-red-500/80 text-white hover:bg-red-600 rounded-xl backdrop-blur-md border border-white/10"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>

                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full" />
            </div>
        </motion.div>
    );
};
