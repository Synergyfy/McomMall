'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
    Gift,
    Ticket,
    Copy,
    Check,
    Download,
    ShieldCheck,
    Sparkles,
    Share2,
    PlusCircle,
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

const PinstripePattern = () => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-10 pointer-events-none">
        <defs>
            <pattern id="pinstripe-dash" patternUnits="userSpaceOnUse" width="100%" height="4">
                <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pinstripe-dash)" />
    </svg>
);

const GoldenHistoryRibbon = () => (
    <div className="absolute bottom-[28%] left-0 w-full h-5 z-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-[0_2px_8px_rgba(0,0,0,0.3)] opacity-90" />
    </div>
);

const GoldenHistoryBow = () => (
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

const VerticalRedRibbon = () => (
    <div className="absolute top-0 left-[25%] bottom-0 w-3 z-20 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-red-500 via-red-600 to-red-800 shadow-[2px_0_10px_rgba(0,0,0,0.3)]" />
    </div>
);

const VoucherWatermark = () => (
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
        <span className="text-[12rem] font-black uppercase rotate-[-15deg] select-none translate-x-12 translate-y-8">Gift</span>
    </div>
);

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
        <div className="w-full max-w-[340px] space-y-4">
            <Link href={`/dashboard/history/gift-card/${purchase.id}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative aspect-[1.58/1] w-full cursor-pointer transition-transform hover:scale-[1.02]"
                >
                    {/* ... (card internals) ... */}
                    <div
                        ref={cardRef}
                        className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 bg-black"
                    >
                        {purchase.template?.backgroundImageUrl ? (
                            <Image
                                src={purchase.template?.backgroundImageUrl || ''}
                                alt="Gift Card"
                                fill
                                className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#800000] to-[#4a0000]" />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                        <PinstripePattern />

                        <GoldenHistoryRibbon />
                        <GoldenHistoryBow />

                        {/* Header */}
                        <div className="absolute top-6 inset-x-6 z-30">
                            <div className="space-y-1 flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-yellow-400 font-black text-2xl tracking-tighter drop-shadow-2xl uppercase italic leading-none">
                                        GIFT CARD
                                    </h3>
                                    <p className="text-white font-bold text-[9px] max-w-[180px] leading-tight opacity-90">
                                        {purchase.template?.description || 'This premium gift card provides access to exclusive mall services.'}
                                    </p>
                                    <p className="text-white/40 text-[7px] font-black uppercase tracking-[0.2em] mt-1">
                                        Verified • {purchase.template?.name || purchase.purchaseBusiness?.businessName || 'McomMall Premium'}
                                    </p>
                                </div>

                                {/* Integrated QR Code */}
                                <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-2xl">
                                    <div className="bg-white p-0.5 rounded-lg">
                                        <QRCode value={purchase.code} size={42} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Balance & Code */}
                        <div className="absolute inset-x-6 bottom-5 flex justify-between items-end z-30">
                            <div className="space-y-1">
                                <span className="text-[6px] font-black text-white/40 uppercase tracking-widest block">Available Balance</span>
                                <p className="text-3xl font-black text-white leading-none tracking-tighter drop-shadow-lg">
                                    {CURRENCY}{Number(purchase.currentBalance).toFixed(2)}
                                </p>
                                <div className="flex items-center gap-2 mt-3 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                                    <span className="text-white/90 font-mono text-[9px] tracking-[0.2em] font-bold">{purchase.code}</span>
                                    <button onClick={handleCopy} className="text-white/60 hover:text-white transition-colors">
                                        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <Sparkles className="text-yellow-400 mb-1 ml-auto drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={20} />
                                <span className="text-[6px] font-black text-white/40 uppercase tracking-widest">Digital Asset</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Link>

            {/* Action Buttons - Fixed positions */}
            <div className="flex items-center justify-start gap-3 mt-4">
                <Button
                    onClick={handleExport}
                    variant="outline"
                    className="h-10 w-10 p-0 rounded-2xl border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all shadow-sm flex items-center justify-center"
                    title="Download Card"
                >
                    <Download size={18} />
                </Button>
                <Button
                    onClick={() => onShare(purchase.id)}
                    variant="outline"
                    className={`h-10 w-10 p-0 rounded-2xl border-gray-200 transition-all ${isShared ? 'text-green-500 border-green-500 bg-green-50' : 'hover:border-blue-500 hover:text-blue-500 shadow-sm'}`}
                    title="Share"
                >
                    {isShared ? <Check size={18} /> : <Share2 size={18} />}
                </Button>
                {onReload && purchase.isReloadable && (
                    <Button
                        onClick={() => onReload?.(purchase)}
                        variant="default"
                        className="h-10 px-4 rounded-2xl bg-[#f58220] hover:bg-[#d9731b] text-white shadow-lg shadow-orange-500/20 font-black uppercase text-[10px] tracking-widest"
                    >
                        <PlusCircle size={18} className="mr-2" /> Reload
                    </Button>
                )}
            </div>
        </div>
    );
};


// --- VOUCHER HISTORY COMPONENT ---

const VoucherBow = () => (
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
    const cardRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(voucher.code);
        setCopied(true);
        toast.success('Voucher code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = () => {
        if (!cardRef.current) return;

        toast.info('Generating image...');
        htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 2 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `voucher-${voucher.code}.png`;
                link.click();
            })
            .catch(() => toast.error('Failed to export voucher.'));
    };

    return (
        <div className="w-full max-w-[340px] space-y-4">
            <Link href={`/dashboard/history/my-vouchers/${voucher.id}`}>
                {/* ... (voucher content) ... */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative cursor-pointer"
                >
                    <div className="group relative aspect-[1.58/1] hover:scale-[1.02] transition-transform duration-300">
                        <div
                            ref={cardRef}
                            className="absolute inset-0 bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 flex"
                        >
                            {/* Left Section (Dark) */}
                            <div className="w-[25%] bg-neutral-900 relative overflow-hidden flex flex-col items-center justify-center p-4">
                                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent opacity-50" />

                                {/* Value Badge on Ribbon Area */}
                                <div className="relative z-40 bg-red-600 w-16 h-16 rounded-full border-4 border-white/20 flex flex-col items-center justify-center shadow-2xl mb-8 translate-x-4">
                                    <span className="text-white text-xs font-black leading-none drop-shadow">{CURRENCY}{Number(voucher.balance).toFixed(0)}</span>
                                </div>

                                <div className="mt-auto relative z-40 translate-x-4">
                                    <ShieldCheck className="text-white/20" size={20} />
                                </div>
                            </div>

                            {/* Right Section (Light) */}
                            <div className="flex-1 bg-white relative p-8 flex flex-col">
                                <VoucherWatermark />
                                <VerticalRedRibbon />
                                <VoucherBow />

                                <div className="relative z-10 flex justify-between items-start mb-4">
                                    <div className="pl-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-white" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">
                                                {voucher.voucherProduct?.name || 'Voucher Name'}
                                            </span>
                                        </div>
                                        <p className="text-[8px] text-gray-400 font-bold tracking-widest pl-6 uppercase">Digital Marketing</p>
                                    </div>

                                    {/* Integrated QR Code */}
                                    <div className="relative z-20 group/qr">
                                        <div className="p-1.5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm transition-transform hover:scale-110 cursor-zoom-in">
                                            <QRCode value={voucher.code} size={42} />
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 pl-4 mt-1 mb-2">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-2">VOUCHER</h2>
                                    <p className="text-[9px] text-gray-400 font-mono uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        {voucher.code}
                                        <button onClick={handleCopy} className="text-gray-300 hover:text-red-600 transition-colors">
                                            {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                        </button>
                                    </p>
                                    <p className="text-[9px] text-gray-500 font-medium leading-relaxed max-w-[200px]">
                                        {voucher.voucherProduct?.description || 'Official digital voucher for premium services.'}
                                    </p>
                                </div>

                                <div className="relative z-10 pl-4 mt-auto flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</span>
                                        <Badge variant="outline" className={`rounded-full text-[8px] font-bold ${['UNREDEEMED', 'PARTIALLY_REDEEMED', 'unredeemed', 'partially_redeemed'].includes(voucher.status) ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            {voucher.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Expires</span>
                                        <span className="text-[9px] font-bold text-gray-900">
                                            {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString() : 'NEVER'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Verified Ribbon Overlay */}
                            <div className="absolute top-0 right-16 z-10">
                                <div className="bg-orange-500 text-white text-[6px] font-black px-3 py-1 rounded-b-lg shadow-sm tracking-[0.2em] uppercase">
                                    Verified
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Link>

            {/* Action Bar - Fixed positions */}
            <div className="flex items-center justify-start gap-3 mt-4">
                <Button
                    onClick={handleExport}
                    variant="outline"
                    className="h-10 w-10 p-0 rounded-2xl border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all shadow-sm flex items-center justify-center"
                    title="Download Voucher"
                >
                    <Download size={18} />
                </Button>
                <Button
                    onClick={() => onShare(voucher.id)}
                    variant="outline"
                    className={`h-10 w-10 p-0 rounded-2xl border-gray-200 transition-all ${isShared ? 'text-green-500 border-green-500 bg-green-50' : 'border-gray-100 hover:border-blue-500 hover:text-blue-500 shadow-sm'}`}
                    title="Share"
                >
                    {isShared ? <Check size={18} /> : <Share2 size={18} />}
                </Button>
            </div>
        </div>
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
    const cardRef = useRef<HTMLDivElement>(null);
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

    const cardName = coupon.couponProduct?.name || coupon.couponProduct?.user?.businessName || 'McomMall Card';

    return (
        <div className="w-full max-w-[340px] space-y-4">
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
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 bg-red-600 rounded-sm shadow-sm" />
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight leading-none">{cardName}</span>
                                    <span className="text-[7.5px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Digital Marketing</span>
                                </div>
                            </div>

                            {/* Integrated QR Code */}
                            <div className="p-1 bg-gray-50 rounded-lg border border-gray-100 shadow-sm translate-y-[-4px]">
                                <QRCode value={coupon.code} size={38} />
                            </div>
                        </div>

                        {/* Main Title Area */}
                        <div className="text-center py-0.5 relative z-10">
                            <h2 className="text-5xl font-black text-gray-900 tracking-[-0.06em] uppercase italic leading-[0.85]">
                                COUPON
                            </h2>
                            <p className="text-[8px] text-gray-400 font-bold mt-1 pr-6 max-w-[220px] mx-auto leading-relaxed uppercase tracking-wider">
                                This voucher is applicable for all premium services and products across our platform.
                            </p>
                        </div>

                        {/* Bottom Actions & Code */}
                        <div className="flex items-end justify-between relative z-10">
                            <div className="space-y-1">
                                <div className="px-5 py-1.5 rounded-full border-2 border-gray-900 text-gray-900 font-black uppercase tracking-[0.15em] text-[9px]">
                                    {cardName}
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
                </div>
            </motion.div>

            {/* Action Buttons - Fixed positions */}
            <div className="flex items-center justify-start gap-3 mt-4">
                <Button
                    onClick={handleExport}
                    variant="outline"
                    className="h-10 w-10 p-0 rounded-[1.25rem] border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all shadow-sm flex items-center justify-center"
                    title="Download Coupon"
                >
                    <Download size={18} />
                </Button>
                <Button
                    onClick={() => onShare(coupon.id)}
                    variant="outline"
                    className={`h-10 w-10 p-0 rounded-[1.25rem] border-gray-200 transition-all ${isShared ? 'text-green-500 border-green-500 shadow-green-100' : 'hover:border-blue-500 hover:text-blue-500 shadow-sm'}`}
                    title="Share"
                >
                    {isShared ? <Check size={20} /> : <Share2 size={20} />}
                </Button>
                {coupon.couponProduct?.allowReloading && (
                    <Button
                        onClick={() => onReload(coupon)}
                        variant="default"
                        className="h-10 px-4 rounded-[1.25rem] bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-500/20 font-black uppercase text-[10px] tracking-widest flex items-center"
                    >
                        <PlusCircle size={18} className="mr-2" /> Top Up
                    </Button>
                )}
            </div>
        </div>
    );
};
