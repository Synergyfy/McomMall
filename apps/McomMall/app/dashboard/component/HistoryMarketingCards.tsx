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
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CURRENCY } from '@/lib/utils';
import { toast } from 'sonner';
import { MyPurchase } from '@/service/gift-card/types';
import { Voucher } from '@/service/vouchers/types';
import { Coupon } from '@/service/my-coupons/types';
import QRCode from 'react-qr-code';
import * as htmlToImage from 'html-to-image';

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
            <Link href={`/dashboard/history/gift-card/${purchase.id}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative aspect-[1.58/1] w-full cursor-pointer transition-transform hover:scale-[1.02]"
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
                                    {purchase.purchaseBusiness?.businessName || 'McomMall Gift Card'}
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
            </Link>

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

const VoucherBow = () => (
    <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none scale-[1.2]">
        <div className="relative">
            {/* Main Bow Loops */}
            <div className="absolute -left-7 top-0 w-14 h-12 border-[6px] border-red-700 rounded-full bg-red-600 rotate-[-25deg] shadow-lg" />
            <div className="absolute -right-7 top-0 w-14 h-12 border-[6px] border-red-700 rounded-full bg-red-600 rotate-[25deg] shadow-lg" />

            {/* Bow Tails */}
            <div className="absolute top-5 -left-5 w-7 h-14 bg-red-700 skew-x-[-20deg]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)' }} />
            <div className="absolute top-5 -right-5 w-7 h-14 bg-red-700 skew-x-[20deg]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)' }} />

            {/* Center Knot */}
            <div className="relative w-8 h-9 bg-red-800 rounded-lg shadow-2xl z-10 border border-red-900" />
        </div>
    </div>
);

export const HistoryCoupon: React.FC<HistoryCouponProps> = ({
    coupon,
    onShare,
    onReload,
    isShared
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        toast.success('Coupon code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = () => {
        if (!cardRef.current) return;

        toast.info('Generating image...');
        htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 2 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `coupon-${coupon.code}.png`;
                link.click();
            })
            .catch(() => toast.error('Failed to export coupon.'));
    };

    const businessName = coupon.couponProduct?.user?.businessName || 'YOUR COMPANY NAME';

    return (
        <div className="space-y-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative aspect-[2.4/1] w-full transition-transform hover:scale-[1.01]"
            >
                <div
                    ref={cardRef}
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl border border-gray-100 flex bg-white"
                >
                    {/* Left Black Section */}
                    <div className="w-[25%] bg-[#121212] relative flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-red-600 shadow-2xl border-4 border-white/20 flex flex-col items-center justify-center text-white z-10">
                            <span className="font-black text-2xl italic leading-none">{CURRENCY}{Math.floor(Number(coupon.balance))}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">VALUE</span>
                        </div>
                    </div>

                    {/* Red Ribbon Strip */}
                    <div className="absolute top-0 left-[23%] w-6 h-full bg-red-600 shadow-[2px_0_10px_rgba(0,0,0,0.3)] z-10" />

                    {/* Red Bow Overlay */}
                    <VoucherBow />

                    {/* Right White Section */}
                    <div className="flex-1 bg-white relative p-6 pl-16 flex flex-col justify-between">
                        {/* Background Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
                            <span className="text-9xl font-black italic -rotate-12 scale-150">GIFT</span>
                        </div>

                        {/* Top Brand Info */}
                        <div className="flex items-center gap-2 relative z-10">
                            <div className="w-3.5 h-3.5 bg-red-600 rounded-sm shadow-sm" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight leading-none">{businessName}</span>
                                <span className="text-[7.5px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Digital Marketing</span>
                            </div>
                        </div>

                        {/* Main Title Area */}
                        <div className="text-center py-1 relative z-10">
                            <h2 className="text-6xl font-black text-gray-900 tracking-[-0.06em] uppercase italic leading-[0.85]">
                                COUPON
                            </h2>
                            <p className="text-[8px] text-gray-400 font-bold mt-2 pr-6 max-w-[220px] mx-auto leading-relaxed uppercase tracking-wider">
                                This voucher is applicable for all premium services and products across our digital platform.
                            </p>
                        </div>

                        {/* Bottom Actions & Code */}
                        <div className="flex items-end justify-between relative z-10">
                            <div className="space-y-1">
                                <div className="px-5 py-1.5 rounded-full border-2 border-gray-900 text-gray-900 font-black uppercase tracking-[0.15em] text-[9px]">
                                    {businessName}
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                                    <span className="text-gray-900 font-mono text-[11px] font-bold tracking-[0.2em]">{coupon.code}</span>
                                    <button onClick={handleCopy} className="text-gray-400 hover:text-red-600 transition-colors">
                                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">
                                    Validity: {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'LIFETIME'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* QR Overlay */}
                    <AnimatePresence>
                        {showQR && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-white/98 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30"
                            >
                                <div className="p-4 rounded-[2.5rem] border border-gray-100 shadow-2xl bg-white">
                                    <QRCode value={coupon.code} size={140} />
                                </div>
                                <p className="text-gray-900 font-mono text-sm tracking-[0.3em] mt-6 font-black uppercase">{coupon.code}</p>
                                <button
                                    onClick={() => setShowQR(false)}
                                    className="mt-6 text-red-600 hover:text-red-700 uppercase text-[10px] font-black tracking-[0.2em] transition-all border-b-2 border-red-100 hover:border-red-600 pb-1"
                                >
                                    Close Scanner
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Premium Action Buttons */}
            <div className="flex gap-3">
                <Button
                    onClick={() => setShowQR(true)}
                    variant="outline"
                    className="flex-1 h-12 rounded-[1.25rem] border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all font-black uppercase text-[10px] tracking-widest shadow-sm"
                >
                    <QrCode size={18} className="mr-2" /> Activate
                </Button>
                <Button
                    onClick={handleExport}
                    variant="outline"
                    className="h-12 w-12 p-0 rounded-[1.25rem] border-gray-200 hover:border-red-600 hover:text-red-600 transition-all shadow-sm"
                >
                    <Download size={18} />
                </Button>
                {coupon.couponProduct?.allowReloading && (
                    <Button
                        onClick={() => onReload(coupon)}
                        variant="default"
                        className="h-12 px-6 rounded-[1.25rem] bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-500/20 font-black uppercase text-[10px] tracking-widest flex items-center"
                    >
                        <PlusCircle size={18} className="mr-2" /> Top Up
                    </Button>
                )}
                <Button
                    onClick={() => onShare(coupon.id)}
                    variant="outline"
                    className={`h-12 w-12 p-0 rounded-[1.25rem] border-gray-200 transition-all ${isShared ? 'text-green-500 border-green-500 shadow-green-100' : 'hover:border-blue-500 hover:text-blue-500 shadow-sm'}`}
                >
                    {isShared ? <Check size={20} /> : <Share2 size={20} />}
                </Button>
            </div>
        </div>
    );
};
