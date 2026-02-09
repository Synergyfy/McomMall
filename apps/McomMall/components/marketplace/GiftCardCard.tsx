'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Gift, Sparkles, Star, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PromotionalItem } from '@/lib/listing-data';

interface GiftCardCardProps {
    giftCard: PromotionalItem;
    viewMode?: 'grid' | 'list';
}

const gradientThemes = [
    'from-amber-400 via-orange-400 to-rose-500', // Gold/Orange (Primary)
    'from-orange-400 via-amber-500 to-yellow-500', // Amber
    'from-rose-400 via-orange-400 to-amber-500', // Rose Gold
    'from-slate-300 via-gray-300 to-zinc-400', // Silver
];

export default function GiftCardCard({ giftCard, viewMode = 'grid' }: GiftCardCardProps) {
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
                                "w-full h-full rounded-xl bg-gradient-to-br shadow-xl p-6 relative overflow-hidden group-hover:scale-105 transition-transform duration-500",
                                gradientClass
                            )}>
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12" />

                                <div className="relative z-10 h-full flex flex-col justify-between text-white">
                                    <div className="flex justify-between items-start">
                                        <Gift className="w-8 h-8" />
                                        <Sparkles className="w-6 h-6" />
                                    </div>

                                    <div>
                                        <div className="text-xs opacity-80 mb-1">GIFT CARD</div>
                                        <div className="font-mono text-lg tracking-wider">•••• •••• •••• ••••</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right - Details */}
                        <div className="flex-1 p-6">
                            <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 mb-3">
                                <Gift className="w-3 h-3 mr-1" />
                                Gift Card
                            </Badge>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{giftCard.title}</h3>

                            {hasBonus && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <Star className="w-4 h-4 fill-green-500" />
                                        <span className="font-semibold text-sm">
                                            Buy £{giftCard.bonusThreshold}, Get £{giftCard.bonusAmount} FREE!
                                        </span>
                                    </div>
                                </div>
                            )}

                            {displayAmounts.length > 0 && (
                                <div className="mb-4">
                                    <div className="text-sm text-gray-600 mb-2">Available amounts:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {displayAmounts.map((amount, idx) => (
                                            <div
                                                key={idx}
                                                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border border-gray-200 font-semibold text-gray-900 hover:border-orange-500 hover:shadow-md transition-all"
                                            >
                                                £{amount}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-baseline gap-2 mt-auto">
                                {hasMultipleAmounts && (
                                    <span className="text-sm text-gray-500">From</span>
                                )}
                                <span className="text-3xl font-bold text-gray-900">
                                    £{Number(minPrice).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Grid View - Card-like Design
    return (
        <Link href={giftCard.link || `/gift-cards/${giftCard.id}`} className="block h-full">
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:scale-[1.02]">

                {/* Gift Card Visual */}
                <div className="relative h-48 p-6 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <div className={cn(
                        "w-full h-full rounded-xl bg-gradient-to-br shadow-xl p-4 relative overflow-hidden group-hover:rotate-3 group-hover:scale-105 transition-all duration-500",
                        gradientClass
                    )}>
                        {/* Animated shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%]"
                            style={{ transition: 'all 1.5s ease-in-out' }} />

                        {/* Card content */}
                        <div className="relative z-10 h-full flex flex-col justify-between text-white">
                            <div className="flex justify-between items-start">
                                <Gift className="w-6 h-6 md:w-8 md:h-8 drop-shadow-lg" />
                                <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                            </div>

                            <div>
                                <div className="text-[10px] md:text-xs opacity-80 mb-1 font-semibold tracking-wide">
                                    GIFT CARD
                                </div>
                                <div className="font-mono text-sm md:text-base tracking-wider drop-shadow">
                                    •••• •••• •••• ••••
                                </div>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                    </div>

                    {/* Type Badge */}
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 shadow-lg z-10">
                        <Gift className="w-3 h-3 mr-1" />
                        Gift Card
                    </Badge>
                </div>

                {/* Details Section */}
                <div className="flex-1 p-4 flex flex-col">
                    <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {giftCard.title}
                    </h3>

                    {/* Bonus Badge */}
                    {hasBonus && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2 mb-3">
                            <div className="flex items-center gap-1 text-green-700">
                                <Star className="w-3 h-3 fill-green-500 flex-shrink-0" />
                                <span className="font-semibold text-[10px] md:text-xs">
                                    Buy £{giftCard.bonusThreshold}, Get £{giftCard.bonusAmount} FREE
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Amount Options */}
                    {displayAmounts.length > 0 && (
                        <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-1">Options:</div>
                            <div className="flex flex-wrap gap-1">
                                {displayAmounts.slice(0, 3).map((amount, idx) => (
                                    <div
                                        key={idx}
                                        className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded text-xs font-semibold text-gray-700 border border-gray-200"
                                    >
                                        £{amount}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Price */}
                    <div className="mt-auto flex items-baseline gap-1">
                        {hasMultipleAmounts && (
                            <span className="text-xs text-gray-500">From</span>
                        )}
                        <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            £{Number(minPrice).toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full" />
            </div>
        </Link>
    );
}
