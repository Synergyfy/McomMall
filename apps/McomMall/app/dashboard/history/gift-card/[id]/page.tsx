"use client";

import React, { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetMyPurchases } from '@/service/gift-card/hook';
import {
    ChevronLeft,
    Copy,
    Check,
    Download,
    QrCode,
    ShieldCheck,
    Gift,
    Calendar,
    Mail,
    User,
    Building2,
    Phone,
    ArrowRight,
    Sparkles,
    Info,
    Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import * as htmlToImage from 'html-to-image';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="absolute bottom-[28%] left-0 w-full h-8 z-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-90" />
    </div>
);

const GoldenHistoryBow = () => (
    <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 -translate-y-[calc(50%-4px)] z-20 scale-[0.6] pointer-events-none">
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

export default function GiftCardDetailPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const router = useRouter();
    const { data: purchases, isLoading, isError } = useGetMyPurchases();
    const purchase = purchases?.find(p => p.id === id);


    const cardRef = useRef<HTMLDivElement>(null);
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isShared, setIsShared] = useState(false);

    const handleCopy = () => {
        if (!purchase) return;
        navigator.clipboard.writeText(purchase.code);
        setCopied(true);
        toast.success('Code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (!purchase) return;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Mcom Gift Card',
                    text: `Check out this gift card from ${purchase.purchaseBusiness?.businessName}`,
                    url: window.location.href,
                });
                setIsShared(true);
                setTimeout(() => setIsShared(false), 3000);
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (err) {
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
                link.download = `giftcard-${purchase?.code || 'mcom'}.png`;
                link.click();
            })
            .catch(() => toast.error('Failed to export gift card.'));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcfaf8] dark:bg-[#120c08]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#f48c25] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#9c7349] font-bold animate-pulse uppercase tracking-widest text-xs">Securing Your Details...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfaf8] p-4 text-center">
                <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 max-w-md w-full shadow-2xl shadow-red-500/5">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <Info size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Failed to Load</h2>
                    <p className="text-gray-500 mb-8 font-medium">We couldn't retrieve your gift cards. Please try again later.</p>
                    <Button onClick={() => router.push('/dashboard/history/gift-card')} className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                        Return to History
                    </Button>
                </div>
            </div>
        );
    }

    if (!purchase) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfaf8] p-4 text-center">
                <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 max-w-md w-full shadow-2xl shadow-red-500/5">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <Info size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Gift Card Not Found</h2>
                    <p className="text-gray-500 mb-8 font-medium">We couldn't retrieve the details for this gift card. It might have been removed or the link is invalid.</p>
                    <Button onClick={() => router.push('/dashboard/history/gift-card')} className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                        Return to History
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#120c08] pb-24">
            {/* Top Header Navigation */}
            <div className="sticky top-0 z-30 bg-white/70 dark:bg-[#1c140d]/70 backdrop-blur-xl border-b border-[#e8dbce]/50 dark:border-[#4a3b2f]/50 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 text-[#1c140d] dark:text-white font-black uppercase tracking-wider text-[10px]"
                    >
                        <div className="w-8 h-8 rounded-full border border-[#e8dbce] dark:border-[#4a3b2f] flex items-center justify-center group-hover:bg-[#f48c25] group-hover:border-[#f48c25] group-hover:text-white transition-all">
                            <ChevronLeft size={16} />
                        </div>
                        Back to Dashboard
                    </button>

                    <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 rounded-full border-none font-black text-[9px] px-3 py-1">
                            ACTIVE CARD
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* Card Visual Column */}
                    <div className="space-y-8 lg:sticky lg:top-32 text-center lg:text-left">
                        <div className="relative inline-block w-full max-w-[380px]">
                            {/* Premium Glow Background */}
                            <div className="absolute -inset-4 bg-gradient-to-tr from-[#f48c25]/30 via-transparent to-[#f48c25]/10 blur-3xl opacity-50" />

                            <div
                                ref={cardRef}
                                className="relative aspect-[1.58/1] w-full rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 bg-black group transition-transform duration-500 hover:scale-[1.02]"
                            >
                                {purchase.template?.backgroundImageUrl ? (
                                    <Image
                                        src={purchase.template.backgroundImageUrl}
                                        alt="Gift Card"
                                        fill
                                        className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#800000] to-[#4a0000]" />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                                <PinstripePattern />

                                <GoldenHistoryRibbon />
                                <GoldenHistoryBow />

                                {/* Card Branding */}
                                <div className="absolute top-8 inset-x-8 z-30 text-left">
                                    <div className="space-y-1 flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="text-yellow-400 font-black text-4xl tracking-tighter drop-shadow-2xl uppercase italic leading-[0.8]">
                                                GIFT CARD
                                            </h3>
                                            <p className="text-white font-bold text-[11px] max-w-[240px] leading-tight mt-2 opacity-90">
                                                {purchase.template?.description || 'This premium gift card provides access to exclusive mall services and products.'}
                                            </p>
                                            <p className="text-white/40 text-[8px] font-black uppercase tracking-[0.4em] mt-3">
                                                Verified • {purchase.purchaseBusiness?.businessName}
                                            </p>
                                        </div>

                                        {/* Integrated QR Code */}
                                        <div className="bg-white/10 backdrop-blur-2xl p-2 rounded-[1.5rem] border border-white/20 shadow-2xl">
                                            <div className="bg-white p-1 rounded-xl">
                                                <QRCode value={purchase.code} size={56} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Value & Identifier */}
                                <div className="absolute inset-x-8 bottom-8 flex justify-between items-end z-30 text-left">
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] block">Stored Value</span>
                                        <p className="text-5xl font-black text-white leading-none tracking-tighter drop-shadow-md">
                                            {purchase.currency}{Number(purchase.currentBalance).toFixed(2)}
                                        </p>
                                        <div className="flex items-center gap-3 mt-6 bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                                            <span className="text-white font-mono text-xs tracking-[0.3em] font-bold">{purchase.code}</span>
                                            <button onClick={handleCopy} className="text-white/60 hover:text-white transition-all transform active:scale-90">
                                                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Sparkles className="text-yellow-400 mb-3 ml-auto drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]" size={32} />
                                        <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em]">Verified Product</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Action Buttons */}
                        <div className="flex flex-wrap gap-4 pt-10 justify-center lg:justify-start">
                            <Button
                                onClick={handleExport}
                                variant="outline"
                                className="h-16 flex-1 min-w-[200px] rounded-3xl border-[#e8dbce] dark:border-[#4a3b2f] hover:bg-black hover:text-white transition-all font-black uppercase text-[10px] tracking-widest shadow-sm flex items-center justify-center"
                            >
                                <Download size={22} className="mr-3" /> Download Voucher
                            </Button>
                            <Button
                                onClick={handleShare}
                                variant="outline"
                                className={`h-16 w-16 p-0 rounded-3xl border-[#e8dbce] dark:border-[#4a3b2f] transition-all ${isShared ? 'text-green-500 border-green-500 bg-green-50' : 'hover:border-blue-500 hover:text-blue-500'}`}
                            >
                                {isShared ? <Check size={22} /> : <Share2 size={22} />}
                            </Button>
                        </div>
                    </div>

                    {/* Details Column */}
                    <div className="space-y-10">
                        {/* Shop Section */}
                        <div className="bg-white dark:bg-[#1c140d] rounded-[2.5rem] p-10 border border-[#e8dbce]/50 dark:border-[#4a3b2f]/50 shadow-xl shadow-[#1c140d]/5">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="size-14 rounded-2xl bg-[#fff8f1] dark:bg-[#f48c25]/10 flex items-center justify-center text-[#f48c25]">
                                    <Building2 size={26} />
                                </div>
                                <div>
                                    <p className="text-[#9c7349] text-[10px] font-black uppercase tracking-widest">Issuing Business</p>
                                    <h2 className="text-2xl font-black text-[#1c140d] dark:text-white tracking-tight">{purchase.purchaseBusiness?.businessName}</h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[#9c7349] mb-1">
                                        <User size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Business Owner</span>
                                    </div>
                                    <p className="text-[#1c140d] dark:text-white font-bold text-lg">
                                        {purchase.purchaseBusiness?.legalName || purchase.purchaseBusiness?.businessName || '—'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[#9c7349] mb-1">
                                        <Building2 size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Legal Name</span>
                                    </div>
                                    <p className="text-[#1c140d] dark:text-white font-bold text-lg">{purchase.purchaseBusiness?.legalName}</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[#9c7349] mb-1">
                                        <Mail size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Email Contact</span>
                                    </div>
                                    <p className="text-[#1c140d] dark:text-white font-bold">{purchase.purchaseBusiness?.businessEmail}</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[#9c7349] mb-1">
                                        <Phone size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Support Phone</span>
                                    </div>
                                    <p className="text-[#1c140d] dark:text-white font-bold">{purchase.purchaseBusiness?.businessPhone}</p>
                                </div>
                            </div>

                            <div className="mt-10 pt-10 border-t border-[#e8dbce]/50 dark:border-[#4a3b2f]/50">
                                <Button onClick={() => router.push('/marketplace')} className="w-full h-14 bg-[#1c140d] dark:bg-[#f48c25] hover:opacity-90 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#1c140d]/20 transition-all">
                                    Visit Store Marketplace <ArrowRight size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Gift Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#fff8f1] dark:bg-[#1c140d] rounded-3xl p-8 border border-[#f48c25]/10">
                                <div className="flex items-center gap-3 text-[#f48c25] mb-4">
                                    <Calendar size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Acquired On</span>
                                </div>
                                <p className="text-xl font-black text-[#1c140d] dark:text-white">
                                    {new Date(purchase.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-[#9c7349] text-[10px] font-medium mt-1">Transaction Verified</p>
                            </div>

                            <div className="bg-[#f4ede7] dark:bg-white/5 rounded-3xl p-8 border border-[#e8dbce]/50">
                                <div className="flex items-center gap-3 text-[#1c140d] dark:text-[#f48c25] mb-4">
                                    <User size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Recipient</span>
                                </div>
                                <p className="text-xl font-black text-[#1c140d] dark:text-white">
                                    {purchase.recipientName || 'Myself'}
                                </p>
                                <p className="text-[#9c7349] text-[10px] font-medium mt-1 break-all">{purchase.recipientEmail}</p>
                            </div>
                        </div>

                        {/* Personal Message Section */}
                        {purchase.personalMessage && (
                            <div className="relative bg-white dark:bg-[#1c140d] rounded-[2.5rem] p-10 border border-[#e8dbce]/50 dark:border-[#4a3b2f]/50 shadow-sm overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 text-[#f48c25]/20">
                                    <Sparkles size={120} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-6 text-[#f48c25]">
                                        <div className="w-1 h-6 bg-[#f48c25] rounded-full" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Personal Message</span>
                                    </div>
                                    <p className="text-[#1c140d] dark:text-white/80 text-lg font-bold leading-relaxed italic">
                                        "{purchase.personalMessage}"
                                    </p>
                                    <p className="text-[#9c7349] text-[10px] font-black uppercase tracking-widest mt-6">
                                        — From {purchase.senderName}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Summary List */}
                        <div className="bg-white dark:bg-[#1c140d] rounded-[2.5rem] p-8 md:p-10 border border-[#e8dbce]/50 dark:border-[#4a3b2f]/50 space-y-6 shadow-sm">
                            <div className="flex justify-between items-center pb-6 border-b border-[#f4ede7] dark:border-[#4a3b2f]/50">
                                <span className="text-[#9c7349] text-[11px] font-black uppercase tracking-[0.2em]">Initial Purchase Amount</span>
                                <span className="text-[#1c140d] dark:text-white font-black text-xl">{purchase.currency}{Number(purchase.initialBalance).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-6 border-b border-[#f4ede7] dark:border-[#4a3b2f]/50">
                                <span className="text-[#9c7349] text-[11px] font-black uppercase tracking-[0.2em]">Redemption History</span>
                                <span className="text-[#1c140d] dark:text-white font-black text-xl">0 Transactions</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#fcfaf8] dark:bg-black/20 p-6 rounded-2xl border border-[#f4ede7] dark:border-[#4a3b2f]/50">
                                <span className="text-[#f48c25] text-[11px] font-black uppercase tracking-[0.2em]">Available Funds</span>
                                <span className="text-[#f48c25] font-black text-2xl tracking-tighter">{purchase.currency}{Number(purchase.currentBalance).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
