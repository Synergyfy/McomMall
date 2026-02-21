'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Gift, Sparkles, Star, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PromotionalItem } from '@/lib/listing-data';
import { useState, useEffect } from 'react';

interface GiftCardCardProps {
    giftCard: PromotionalItem;
    viewMode?: 'grid' | 'list';
    hidePrice?: boolean;
}

const gradientThemes = [
    'from-amber-400 via-orange-400 to-rose-500', // Gold/Orange (Primary)
    'from-orange-400 via-amber-500 to-yellow-500', // Amber
    'from-rose-400 via-orange-400 to-amber-500', // Rose Gold
    'from-slate-300 via-gray-300 to-zinc-400', // Silver
];

const GoldenRibbon = () => (
    <div className="absolute bottom-[20%] left-0 w-full h-2 z-10">
        <div className="w-full h-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-md" />
    </div>
);

const GoldenBow = () => (
    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 -translate-y-[calc(50%-4px)] z-20 scale-[0.6]">
        <div className="relative w-12 h-8 flex items-center justify-center">
            <div className="absolute -left-1 w-6 h-6 border-2 border-yellow-500 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 rotate-[-15deg]" />
            <div className="absolute -right-1 w-6 h-6 border-2 border-yellow-500 rounded-full bg-gradient-to-bl from-amber-400 to-yellow-600 rotate-[15deg]" />
            <div className="relative w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 border border-yellow-200 z-10" />
        </div>
    </div>
);

export default function GiftCardCard({ giftCard, viewMode = 'grid', hidePrice = false }: GiftCardCardProps) {
    const [localLogo, setLocalLogo] = useState<string | null>(null);

    useEffect(() => {
        if (giftCard.id) {
            const storedLogo = localStorage.getItem(`gift-card-logo-${giftCard.id}`);
            if (storedLogo) {
                setLocalLogo(storedLogo);
            }
        }
    }, [giftCard.id]);

    // Select gradient based on ID
    const idNum = typeof giftCard.id === 'number'
        ? giftCard.id
        : String(giftCard.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradientIndex = idNum % gradientThemes.length;
    const gradientClass = gradientThemes[gradientIndex];

    const hasMultipleAmounts = giftCard.fixedAmounts && giftCard.fixedAmounts.length > 1;
    const minPrice = giftCard.fixedAmounts && giftCard.fixedAmounts.length > 0
        ? Math.min(...giftCard.fixedAmounts)
        : giftCard.price || 0;

    const displayAmounts = giftCard.fixedAmounts?.slice(0, 4) || [];
    const hasBonus = giftCard.bonusAmount && giftCard.bonusThreshold;

    if (viewMode === 'list') {
        return (
            <Link href={giftCard.link || `/gift-cards/${giftCard.id}`} className="block">
                <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                    <div className="flex flex-col sm:flex-row">
                        {/* Left - Gift Card Visual */}
                        <div className="relative w-full sm:w-80 h-48 flex-shrink-0 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className={cn(
                                "w-full h-full rounded-2xl bg-gradient-to-br shadow-xl p-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-500",
                                gradientClass
                            )}>
                                <GoldenRibbon />
                                <GoldenBow />

                                {/* Brand Name Overlay */}
                                <div className="absolute inset-0 z-20 flex items-center justify-center p-8">
                                    <div className="text-center group-hover:scale-110 transition-transform duration-500 max-w-full px-4">
                                        <h2 className="text-4xl font-black text-white/90 tracking-[0.2em] uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] leading-tight">
                                            {giftCard.title}
                                        </h2>
                                        <div className="h-1 w-16 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mt-4 rounded-full opacity-60" />
                                    </div>
                                </div>

                                <div className="relative z-30 h-full flex flex-col justify-between text-white">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-2xl font-black text-yellow-400 italic">GIFT CARD</h4>
                                        {localLogo ? (
                                            <div className="w-10 h-10 bg-white shadow-sm rounded-md p-1 flex items-center justify-center">
                                                <img src={localLogo} alt="Logo" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                            </div>
                                        ) : (
                                            <Sparkles className="w-5 h-5 text-yellow-300" />
                                        )}
                                    </div>

                                    <div>
                                        <div className="font-mono text-sm tracking-widest text-white/80">•••• •••• ••••</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right - Details */}
                        <div className="flex-1 p-6 flex flex-col justify-center">
                            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 w-fit mb-4">
                                <Gift className="w-3 h-3 mr-1" />
                                Premium Gift Card
                            </Badge>

                            {!hidePrice && (
                                <div className="flex items-baseline gap-2">
                                    {hasMultipleAmounts && (
                                        <span className="text-sm text-gray-500">From</span>
                                    )}
                                    <span className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                                        £{Number(minPrice).toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Grid View
    return (
        <Link href={giftCard.link || `/gift-cards/${giftCard.id}`} className="block h-full">
            <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:scale-[1.02]">

                {/* Gift Card Visual */}
                <div className="relative h-48 p-4 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <div className={cn(
                        "w-full h-full rounded-[1.5rem] bg-gradient-to-br shadow-xl p-4 relative overflow-hidden transition-all duration-500",
                        gradientClass
                    )}>
                        <GoldenRibbon />
                        <GoldenBow />

                        {/* Brand Name Overlay */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                            <div className="text-center group-hover:scale-110 transition-transform duration-500 max-w-full px-4">
                                <h2 className="text-2xl font-black text-white/90 tracking-[0.15em] uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] line-clamp-2 leading-tight">
                                    {giftCard.title}
                                </h2>
                                <div className="h-0.5 w-10 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mt-2 rounded-full opacity-60" />
                            </div>
                        </div>

                        {/* Card content */}
                        <div className="relative z-30 h-full flex flex-col justify-between text-white">
                            <div className="flex justify-between items-start">
                                <h4 className="text-xl font-black text-yellow-400 italic">GIFT <span className="text-yellow-300">CARD</span></h4>
                                {localLogo ? (
                                    <div className="w-10 h-10 bg-white shadow-sm rounded-md p-1 flex items-center justify-center">
                                        <img src={localLogo} alt="Logo" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                    </div>
                                ) : (
                                    <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                                )}
                            </div>

                            <div>
                                <div className="font-mono text-xs tracking-wider text-white/80">
                                    •••• •••• ••••
                                </div>
                            </div>
                        </div>

                        {/* Glare effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>

                    {/* Type Badge */}
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 shadow-lg z-10 px-3">
                        <Gift className="w-3 h-3 mr-1" />
                        PREMIUM
                    </Badge>
                </div>

                {/* Details Section */}
                <div className="p-4 mt-auto">
                    {/* Price */}
                    {!hidePrice && (
                        <div className="flex items-baseline gap-1 justify-center">
                            {hasMultipleAmounts && (
                                <span className="text-xs text-gray-500">From</span>
                            )}
                            <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                £{Number(minPrice).toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full" />
            </div>
        </Link>
    );
}
