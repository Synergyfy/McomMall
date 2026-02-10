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

export const DashboardGiftCard: React.FC<GiftCardProps> = ({ template, onEdit, onDelete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative aspect-[1.58/1] w-full"
        >
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-xl border border-gray-200 bg-white">
                <Image
                    src={template.backgroundImageUrl || 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80'}
                    alt={template.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" />

                <div className="absolute top-4 left-4 w-8 h-6 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-md opacity-80 border border-white/30" />
                <ShieldCheck className="absolute top-4 right-4 text-white/50" size={16} />

                <div className="absolute inset-x-4 bottom-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <h3 className="text-lg font-black text-white tracking-tight drop-shadow-md">{template.name}</h3>
                            <p className="text-white/70 text-[8px] font-bold uppercase tracking-[0.2em]">{template.description || 'Premium Gift Experience'}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[7px] font-black text-white/40 uppercase tracking-widest block mb-0.5">Gift Card</span>
                            <Gift className="text-[#f58220] ml-auto" size={14} />
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

// --- Voucher Dashboard Component ---
// --- Voucher Dashboard Component ---
interface VoucherProps {
    product: {
        id: string;
        name: string;
        description?: string;
        isEnabled?: boolean;
        fixedAmounts?: number[];
        bonusAmount?: number;
        backgroundImage?: string | null;
        minCustomAmount?: number | string | null;
        maxCustomAmount?: number | string | null;
        allowCustomAmount?: boolean;
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
            <div className="absolute inset-0 bg-[#F5F5F5] rounded-[2rem] p-6 flex flex-col justify-between border-2 border-dashed border-gray-200 group-hover:border-[#f58220] transition-all overflow-hidden bg-white shadow-sm hover:shadow-md">

                {product.backgroundImage ? (
                    <>
                        <Image
                            src={product.backgroundImage}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </>
                ) : (
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-100 rounded-full blur-3xl opacity-50 transition-opacity" />
                )}

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.3em] mb-2 block ${product.backgroundImage ? 'text-white/90' : 'text-orange-500'}`}>
                            Official Voucher
                        </span>
                        <h3 className={`text-lg font-black leading-tight ${product.backgroundImage ? 'text-white' : 'text-gray-900'}`}>
                            {product.name}
                        </h3>
                        <p className={`text-[10px] font-bold mt-1 line-clamp-2 max-w-[180px] ${product.backgroundImage ? 'text-white/80' : 'text-gray-500'}`}>
                            {product.description || 'Valid for all services and products.'}
                        </p>
                    </div>
                    <div className={`p-3 rounded-2xl border transition-colors ${product.backgroundImage
                        ? 'bg-white/20 border-white/30 text-white'
                        : 'bg-gray-50 border-gray-100 group-hover:bg-orange-50 group-hover:text-orange-500'
                        }`}>
                        <Tag size={20} />
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${product.backgroundImage ? 'text-white/60' : 'text-gray-400'}`}>
                            Price Range
                        </span>
                        <p className={`text-2xl font-black ${product.backgroundImage ? 'text-white' : 'text-gray-900'}`}>
                            {getPriceDisplay()}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(product.id)}
                            className={`h-10 w-10 p-0 rounded-xl transition-colors ${product.backgroundImage
                                ? 'bg-white/20 border-white/30 text-white hover:bg-white hover:text-orange-600 hover:border-white'
                                : 'border-gray-200 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50'
                                }`}
                        >
                            <Pencil size={16} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(product.id)}
                            className={`h-10 w-10 p-0 rounded-xl transition-colors ${product.backgroundImage
                                ? 'bg-red-500/80 border-transparent text-white hover:bg-red-600'
                                : 'border-gray-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50'
                                }`}
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>

                {product.bonusAmount && (
                    <div className="absolute top-6 right-6 rotate-12 group-hover:rotate-0 transition-transform z-10">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-lg text-[9px] font-black shadow-lg">
                            +{CURRENCY}{Number(product.bonusAmount).toFixed(2)}
                        </div>
                    </div>
                )}
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
