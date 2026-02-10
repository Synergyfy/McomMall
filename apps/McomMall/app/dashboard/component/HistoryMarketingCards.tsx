'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    Gift,
    Ticket,
    Zap,
    Trash2,
    Pencil,
    Copy,
    Check,
    Share2,
    PlusCircle,
    Download,
    QrCode,
    ShieldCheck,
    Timer,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CURRENCY } from '@/lib/utils';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import * as htmlToImage from 'html-to-image';
import { MyPurchase } from '@/service/gift-card/types';
import { Voucher } from '@/service/vouchers/types';
import { Coupon } from '@/service/my-coupons/types';

// --- GIFT CARD HISTORY COMPONENT ---

interface HistoryGiftCardProps {
    purchase: MyPurchase;
    onShare: (id: string) => void;
    onReload?: (purchase: MyPurchase) => void;
    isShared?: boolean;
}

export const HistoryGiftCard: React.FC<HistoryGiftCardProps> = ({
    purchase,
    onShare,
    onReload,
    isShared
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(purchase.code);
        setCopied(true);
        toast.success('Code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = () => {
        if (!cardRef.current) return;

        toast.info('Generating image...');
        htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 2 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `giftcard-${purchase.code}.png`;
                link.click();
            })
            .catch(() => toast.error('Failed to export gift card.'));
    };

    return (
        <div className="space-y-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative aspect-[1.58/1] w-full"
            >
                <div
                    ref={cardRef}
                    className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 bg-black"
                >
                    {purchase.template?.backgroundImageUrl ? (
                        <Image
                            src={purchase.template.backgroundImageUrl}
                            alt="Gift Card"
                            fill
                            className="object-cover opacity-80"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Header */}
                    <div className="absolute top-4 inset-x-6 flex justify-between items-start">
                        <div className="space-y-0.5">
                            <h3 className="text-white font-black text-lg tracking-tight drop-shadow-lg uppercase italic">
                                {purchase.purchaseBusiness.businessName}
                            </h3>
                            <p className="text-white/60 text-[7px] font-bold uppercase tracking-[0.2em]">Premium Gift Experience</p>
                        </div>
                        <ShieldCheck className="text-white/40" size={16} />
                    </div>

                    {/* Chip visual */}
                    <div className="absolute top-14 left-6 w-10 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-lg opacity-90 border border-white/30" />

                    {/* Balance & Code */}
                    <div className="absolute inset-x-6 bottom-6 flex justify-between items-end">
                        <div className="space-y-0.5">
                            <span className="text-[7px] font-black text-white/40 uppercase tracking-widest block">Current Balance</span>
                            <p className="text-3xl font-black text-white leading-none tracking-tighter">
                                {CURRENCY}{Number(purchase.currentBalance).toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2 mt-3 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                                <span className="text-white/90 font-mono text-[10px] tracking-[0.2em]">{purchase.code}</span>
                                <button onClick={handleCopy} className="text-white/60 hover:text-white transition-colors">
                                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <Gift className="text-[#f58220] ml-auto mb-1.5" size={20} />
                            <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Official Card</span>
                        </div>
                    </div>

                    {/* QR Overlay */}
                    <AnimatePresence>
                        {showQR && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute inset-0 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-10"
                            >
                                <div className="bg-white p-4 rounded-3xl shadow-2xl">
                                    <QRCode value={purchase.code} size={160} />
                                </div>
                                <p className="text-white font-mono text-sm tracking-widest mt-6">{purchase.code}</p>
                                <button
                                    onClick={() => setShowQR(false)}
                                    className="mt-6 text-white/60 hover:text-white uppercase text-[10px] font-black tracking-widest border-b border-white/20 pb-1"
                                >
                                    Close Scanner
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    onClick={() => setShowQR(true)}
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all font-black uppercase text-[10px] tracking-widest"
                >
                    <QrCode size={18} className="mr-2" /> Show QR
                </Button>
                <Button
                    onClick={handleExport}
                    variant="outline"
                    className="h-12 w-12 p-0 rounded-2xl border-gray-200 hover:border-orange-500 hover:text-orange-500 transition-all font-black"
                >
                    <Download size={18} />
                </Button>
                {onReload && purchase.isReloadable && (
                    <Button
                        onClick={() => onReload(purchase)}
                        variant="default"
                        className="h-12 px-6 rounded-2xl bg-[#f58220] hover:bg-[#d9731b] text-white shadow-lg shadow-orange-500/20 font-black uppercase text-[10px] tracking-widest"
                    >
                        <PlusCircle size={18} className="mr-2" /> Reload
                    </Button>
                )}
                <Button
                    onClick={() => onShare(purchase.id)}
                    variant="outline"
                    className={`h-12 w-12 p-0 rounded-2xl border-gray-200 transition-all ${isShared ? 'text-green-500 border-green-500' : 'hover:border-blue-500 hover:text-blue-500'}`}
                >
                    {isShared ? <Check size={18} /> : <Share2 size={18} />}
                </Button>
            </div>
        </div>
    );
};


// --- VOUCHER HISTORY COMPONENT ---

interface HistoryVoucherProps {
    voucher: Voucher;
    onShare: (id: string) => void;
    isShared?: boolean;
}

export const HistoryVoucher: React.FC<HistoryVoucherProps> = ({
    voucher,
    onShare,
    isShared
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(voucher.code);
        setCopied(true);
        toast.success('Voucher code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
        >
            <div className="bg-white rounded-[2rem] p-6 flex flex-col justify-between border-2 border-dashed border-gray-200 group-hover:border-[#f58220] transition-all overflow-hidden aspect-[1.58/1]">
                <div className="absolute top-0 right-0 p-8">
                    <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <QRCode value={voucher.code} size={50} />
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] mb-2 block">Official Voucher</span>
                    <h3 className="text-xl font-black text-gray-900 leading-tight pr-16">{voucher.voucherProduct?.name || 'McomMall Voucher'}</h3>
                    <p className="text-gray-400 text-[10px] font-bold mt-2 font-mono uppercase tracking-widest">
                        {voucher.code}
                        <button onClick={handleCopy} className="ml-2 align-middle inline-block text-gray-300 hover:text-orange-500">
                            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </button>
                    </p>
                </div>

                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Available Balance</span>
                        <p className="text-3xl font-black text-gray-900">{CURRENCY}{Number(voucher.balance).toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="rounded-full bg-gray-50 text-[8px] font-bold border-gray-200">
                                {voucher.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">
                                Expires: {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString() : 'Never'}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onShare(voucher.id)}
                            className={`h-12 w-12 p-0 rounded-2xl border-gray-200 transition-all ${isShared ? 'text-green-500' : 'hover:border-blue-500 hover:text-blue-500'}`}
                        >
                            {isShared ? <Check size={18} /> : <Share2 size={18} />}
                        </Button>
                    </div>
                </div>

                {/* Notches */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-r-2 border-slate-50" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-l-2 border-slate-50" />
            </div>
        </motion.div>
    );
};


// --- COUPON HISTORY COMPONENT ---

interface HistoryCouponProps {
    coupon: Coupon;
    onShare: (id: string) => void;
    onReload: (coupon: Coupon) => void;
    isShared?: boolean;
}

export const HistoryCoupon: React.FC<HistoryCouponProps> = ({
    coupon,
    onShare,
    onReload,
    isShared
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        toast.success('Coupon code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative aspect-[1.58/1]"
        >
            <div className="absolute inset-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                {/* Top Accent Strip */}
                <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 to-red-500" />

                <div className="p-6 flex-1 flex flex-col justify-between relative">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-none font-bold tracking-wide">
                                <Zap size={10} className="mr-1 fill-orange-700" /> FLASH COUPON
                            </Badge>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Timer size={12} /> {coupon.status}
                            </span>
                        </div>
                    </div>

                    {/* Center Code Area */}
                    <div className="text-center w-full">
                        <div className="inline-flex items-center justify-center gap-3 bg-slate-50 rounded-xl px-5 py-3 border-2 border-dashed border-slate-200 group-hover:border-orange-200 transition-colors w-full">
                            <h3 className="text-2xl font-mono font-bold text-slate-800 tracking-widest text-center">
                                {coupon.code}
                            </h3>
                            <button onClick={handleCopy} className="text-slate-400 hover:text-orange-600 transition-colors">
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-3">
                            Expires: {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-end justify-between mt-2">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Balance</span>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{CURRENCY}{Number(coupon.balance).toFixed(2)}</p>
                        </div>

                        <div className="flex gap-2">
                            {coupon.couponProduct?.allowReloading && (
                                <Button
                                    onClick={() => onReload(coupon)}
                                    size="sm"
                                    variant="outline"
                                    className="h-9 px-4 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-orange-600 hover:bg-orange-50 border-slate-200"
                                >
                                    <PlusCircle size={14} className="mr-1.5" /> Reload
                                </Button>
                            )}
                            <Button
                                onClick={() => onShare(coupon.id)}
                                size="sm"
                                variant="outline"
                                className={`h-9 w-9 p-0 rounded-lg border-slate-200 transition-all ${isShared ? 'bg-green-50 text-green-600 border-green-200' : 'text-slate-400 hover:text-orange-600 hover:border-orange-200'}`}
                            >
                                {isShared ? <Check size={16} /> : <Share2 size={16} />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Decorative Cutouts */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-50 rounded-full border-r border-gray-200" />
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-50 rounded-full border-l border-gray-200" />
            </div>
        </motion.div>
    );
};
