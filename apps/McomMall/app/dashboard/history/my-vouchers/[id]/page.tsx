"use client";

import React, { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetMyVoucherById } from '@/service/hooks/useVoucherService';
import {
    ChevronLeft,
    Copy,
    Check,
    Download,
    ShieldCheck,
    Calendar,
    Mail,
    User,
    Building2,
    ArrowRight,
    Sparkles,
    Info,
    Share2,
    Ticket,
    Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import * as htmlToImage from 'html-to-image';
import { motion } from 'framer-motion';
import { CURRENCY } from '@/lib/utils';

/* ── Decorative sub-components ───────────────────────────── */

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

const VoucherBow = () => (
    <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 z-30 scale-75 pointer-events-none">
        <div className="relative w-24 h-16 flex items-center justify-center">
            <div className="absolute -left-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-br from-red-500 to-red-900 rotate-[-15deg] shadow-lg" />
            <div className="absolute -right-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-bl from-red-500 to-red-900 rotate-[15deg] shadow-lg" />
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 border-2 border-red-500 z-10 shadow-xl" />
            <div className="absolute top-8 -left-3 w-8 h-10 bg-red-700 rounded-bl-3xl rotate-[-20deg] opacity-90" />
            <div className="absolute top-8 -right-3 w-8 h-10 bg-red-700 rounded-br-3xl rotate-[20deg] opacity-90" />
        </div>
    </div>
);

/* ── Page ─────────────────────────────────────────────────── */

export default function VoucherDetailPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';
    const router = useRouter();

    const { myVoucher: voucher, isLoading, isError } = useGetMyVoucherById(id);

    const cardRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [isShared, setIsShared] = useState(false);

    const handleCopy = () => {
        if (!voucher) return;
        navigator.clipboard.writeText(voucher.code);
        setCopied(true);
        toast.success('Code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (!voucher) return;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Mcom Voucher',
                    text: `Check out this voucher: ${voucher.voucherProduct?.name}`,
                    url: window.location.href,
                });
                setIsShared(true);
                setTimeout(() => setIsShared(false), 3000);
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
            setIsShared(true);
            setTimeout(() => setIsShared(false), 2000);
        }
    };

    const handleExport = () => {
        if (!cardRef.current) return;
        toast.info('Generating card image...');
        htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 3 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `voucher-${voucher?.code || 'mcom'}.png`;
                link.click();
            })
            .catch(() => toast.error('Failed to export voucher.'));
    };

    /* ── Loading ── */
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcfaf8] dark:bg-[#0f0a07]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-red-700 font-black animate-pulse uppercase tracking-widest text-xs">Loading your voucher…</p>
                </div>
            </div>
        );
    }

    /* ── Error ── */
    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfaf8] p-4 text-center">
                <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 max-w-md w-full shadow-2xl shadow-red-500/5">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <Info size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Failed to Load</h2>
                    <p className="text-gray-500 mb-8 font-medium">We couldn't retrieve your voucher. Please try again later.</p>
                    <Button onClick={() => router.push('/dashboard/history/my-vouchers')} className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                        Return to Vouchers
                    </Button>
                </div>
            </div>
        );
    }

    /* ── Not found ── */
    if (!voucher) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfaf8] p-4 text-center">
                <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 max-w-md w-full shadow-2xl shadow-red-500/5">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <Ticket size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Voucher Not Found</h2>
                    <p className="text-gray-500 mb-8 font-medium">We couldn't find this voucher. It may have been removed or the link is invalid.</p>
                    <Button onClick={() => router.push('/dashboard/history/my-vouchers')} className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                        Return to Vouchers
                    </Button>
                </div>
            </div>
        );
    }

    const isActive = ['UNREDEEMED', 'unredeemed', 'PARTIALLY_REDEEMED', 'partially_redeemed'].includes(voucher.status);

    /* ── Main ── */
    return (
        <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0f0a07] pb-24">

            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white/70 dark:bg-[#1a0f08]/70 backdrop-blur-xl border-b border-red-100/50 dark:border-red-900/20 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 text-[#1c140d] dark:text-white font-black uppercase tracking-wider text-[10px]"
                    >
                        <div className="w-8 h-8 rounded-full border border-red-200 dark:border-red-900/50 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all">
                            <ChevronLeft size={16} />
                        </div>
                        Back to Vouchers
                    </button>

                    <Badge className={`rounded-full border-none font-black text-[9px] px-3 py-1 ${isActive ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-100'}`}>
                        {voucher.status.replace('_', ' ')}
                    </Badge>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* ── Card Visual Column ── */}
                    <div className="space-y-8 lg:sticky lg:top-32 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative inline-block w-full max-w-[400px]"
                        >
                            {/* Glow */}
                            <div className="absolute -inset-4 bg-gradient-to-tr from-red-500/20 via-transparent to-red-300/10 blur-3xl opacity-60" />

                            {/* Card */}
                            <div
                                ref={cardRef}
                                className="relative aspect-[1.58/1] w-full rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] border border-white/30 bg-white flex"
                            >
                                {/* Left dark strip */}
                                <div className="w-[25%] bg-neutral-900 relative overflow-hidden flex flex-col items-center justify-center p-4">
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent opacity-50" />
                                    <div className="relative z-40 bg-red-600 w-16 h-16 rounded-full border-4 border-white/20 flex flex-col items-center justify-center shadow-2xl mb-8 translate-x-4">
                                        <span className="text-white text-xs font-black leading-none drop-shadow">{CURRENCY}{Number(voucher.balance).toFixed(0)}</span>
                                    </div>
                                    <div className="mt-auto relative z-40 translate-x-4">
                                        <ShieldCheck className="text-white/20" size={20} />
                                    </div>
                                </div>

                                {/* Right light section */}
                                <div className="flex-1 bg-white relative p-8 flex flex-col">
                                    <VoucherWatermark />
                                    <VerticalRedRibbon />
                                    <VoucherBow />

                                    {/* Header row */}
                                    <div className="relative z-10 flex justify-between items-start mb-4">
                                        <div className="pl-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-white" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">
                                                    {voucher.voucherProduct?.name || 'Voucher'}
                                                </span>
                                            </div>
                                            <p className="text-[8px] text-gray-400 font-bold tracking-widest pl-6 uppercase">Digital Marketing</p>
                                        </div>
                                        {/* QR */}
                                        <div className="p-1.5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                                            <QRCode value={voucher.code} size={46} />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="relative z-10 pl-4 mt-1 mb-2">
                                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-2">VOUCHER</h2>
                                        <div className="flex items-center gap-2 text-[9px] text-gray-400 font-mono uppercase tracking-[0.2em] mb-2">
                                            {voucher.code}
                                            <button onClick={handleCopy} className="text-gray-300 hover:text-red-600 transition-colors">
                                                {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom row */}
                                    <div className="relative z-10 pl-4 mt-auto flex items-center justify-between">
                                        <div>
                                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Available Balance</span>
                                            <span className="text-2xl font-black text-gray-900 leading-none">{CURRENCY}{Number(voucher.balance).toFixed(2)}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Expires</span>
                                            <span className="text-[9px] font-bold text-gray-900">
                                                {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString() : 'NEVER'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Verified tag */}
                                <div className="absolute top-0 right-14 z-10">
                                    <div className="bg-orange-500 text-white text-[6px] font-black px-3 py-1 rounded-b-lg shadow tracking-[0.2em] uppercase">Verified</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                            <Button
                                onClick={handleExport}
                                variant="outline"
                                className="h-16 flex-1 min-w-[200px] rounded-3xl border-red-200 dark:border-red-900/30 hover:bg-black hover:text-white hover:border-black transition-all font-black uppercase text-[10px] tracking-widest shadow-sm flex items-center justify-center"
                            >
                                <Download size={22} className="mr-3" /> Download Voucher
                            </Button>
                            <Button
                                onClick={handleShare}
                                variant="outline"
                                className={`h-16 w-16 p-0 rounded-3xl transition-all ${isShared ? 'text-green-500 border-green-500 bg-green-50' : 'border-red-200 hover:border-blue-500 hover:text-blue-500'}`}
                            >
                                {isShared ? <Check size={22} /> : <Share2 size={22} />}
                            </Button>
                        </div>
                    </div>

                    {/* ── Details Column ── */}
                    <div className="space-y-10">

                        {/* Voucher Info Card */}
                        <div className="bg-white dark:bg-[#1a0f08] rounded-[2.5rem] p-10 border border-red-100/50 dark:border-red-900/20 shadow-xl shadow-red-500/5">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="size-14 rounded-2xl bg-red-50 dark:bg-red-600/10 flex items-center justify-center text-red-600">
                                    <Tag size={26} />
                                </div>
                                <div>
                                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Voucher Product</p>
                                    <h2 className="text-2xl font-black text-[#1c140d] dark:text-white tracking-tight">
                                        {voucher.voucherProduct?.name || '—'}
                                    </h2>
                                </div>
                            </div>

                            {voucher.voucherProduct?.description && (
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-8 pb-8 border-b border-red-50 dark:border-red-900/20">
                                    {voucher.voucherProduct.description}
                                </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-red-400 mb-1">
                                        <Sparkles size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Initial Value</span>
                                    </div>
                                    <p className="text-[#1c140d] dark:text-white font-bold text-lg">{CURRENCY}{Number(voucher.initialValue).toFixed(2)}</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-red-400 mb-1">
                                        <ShieldCheck size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Usage Type</span>
                                    </div>
                                    <p className="text-[#1c140d] dark:text-white font-bold text-lg capitalize">
                                        {voucher.voucherProduct?.usage?.replace('_', ' ') || 'Universal'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-red-400 mb-1">
                                        <Calendar size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Acquired On</span>
                                    </div>
                                    <p className="text-[#1c140d] dark:text-white font-bold text-lg">
                                        {new Date(voucher.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-red-400 mb-1">
                                        <Calendar size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Expires</span>
                                    </div>
                                    <p className="text-[#1c140d] dark:text-white font-bold text-lg">
                                        {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Never'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-10 pt-10 border-t border-red-50 dark:border-red-900/20">
                                <Button
                                    onClick={() => router.push('/marketplace')}
                                    className="w-full h-14 bg-[#1c140d] dark:bg-red-600 hover:opacity-90 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#1c140d]/20 transition-all"
                                >
                                    Visit Store Marketplace <ArrowRight size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Recipient Info */}
                        {(voucher.recipientName || voucher.recipientEmail) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {voucher.recipientName && (
                                    <div className="bg-[#fff8f6] dark:bg-[#1a0f08] rounded-3xl p-8 border border-red-100/50">
                                        <div className="flex items-center gap-3 text-red-500 mb-4">
                                            <User size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Recipient</span>
                                        </div>
                                        <p className="text-xl font-black text-[#1c140d] dark:text-white">{voucher.recipientName}</p>
                                    </div>
                                )}
                                {voucher.recipientEmail && (
                                    <div className="bg-red-50/50 dark:bg-white/5 rounded-3xl p-8 border border-red-100/50">
                                        <div className="flex items-center gap-3 text-red-500 mb-4">
                                            <Mail size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Email</span>
                                        </div>
                                        <p className="text-sm font-bold text-[#1c140d] dark:text-white break-all">{voucher.recipientEmail}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Balance Summary */}
                        <div className="bg-white dark:bg-[#1a0f08] rounded-[2.5rem] p-8 md:p-10 border border-red-100/50 dark:border-red-900/20 space-y-6 shadow-sm">
                            <div className="flex justify-between items-center pb-6 border-b border-red-50 dark:border-red-900/20">
                                <span className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em]">Initial Value</span>
                                <span className="text-[#1c140d] dark:text-white font-black text-xl">{CURRENCY}{Number(voucher.initialValue).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-6 border-b border-red-50 dark:border-red-900/20">
                                <span className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em]">Reloadable</span>
                                <span className="text-[#1c140d] dark:text-white font-black text-xl">
                                    {voucher.voucherProduct?.allowReloading ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/20">
                                <span className="text-red-500 text-[11px] font-black uppercase tracking-[0.2em]">Available Balance</span>
                                <span className="text-red-600 font-black text-2xl tracking-tighter">{CURRENCY}{Number(voucher.balance).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
