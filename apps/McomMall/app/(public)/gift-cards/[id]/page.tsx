'use client';

import { useState } from 'react';
import { useGetPublicGiftCardTemplateDetails, useGetPublicGiftCardDetails } from '@/service/gift-card/hook';
import { Loader, ChevronLeft, ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ServiceSafetyCard from '@/app/(public)/services/[id]/components/ServiceSafetyCard';
import { useMarketplaceContext } from '@/context/MarketplaceContext';
import NewGiftCardFlow from '@/components/gift-card/NewGiftCardFlow';
import { GiftCardTemplate, GiftCard } from '@/service/gift-card/types';
import GiftCardCard from '@/components/marketplace/GiftCardCard';
import { PromotionalItem } from '@/lib/listing-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function GiftCardPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const { selectedItem } = useMarketplaceContext();
    const cachedItem = selectedItem && String(selectedItem.id) === String(id) ? selectedItem : null;

    // Detect if ID is a code (16 chars) or UUID
    const isCode = !!(id?.length === 16);

    const { data: templateData, isLoading: templateLoading, isError: templateError } = useGetPublicGiftCardTemplateDetails(id || '', {
        enabled: !cachedItem && !isCode
    });

    const { data: issuedData, isLoading: issuedLoading, isError: issuedError } = useGetPublicGiftCardDetails(id || '', {
        enabled: !cachedItem && isCode
    });

    const giftCard = (cachedItem as unknown as GiftCardTemplate) || templateData || (issuedData as any)?.template;
    const isLoading = templateLoading || issuedLoading;
    const isError = isCode ? issuedError : templateError;

    const displayGiftCard = giftCard;
    const [isBuying, setIsBuying] = useState(false);

    // Spending locations state
    const [spendingLocations, setSpendingLocations] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            const stored = localStorage.getItem(`spending-locations-${id}`);
            if (stored) {
                try {
                    setSpendingLocations(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse spending locations", e);
                }
            }
        }
    }, [id]);

    if (!displayGiftCard && isLoading) {
        return <div className="flex justify-center items-center h-screen bg-gray-50 pt-16"><Loader className="animate-spin text-orange-600" size={48} /></div>;
    }

    if ((!displayGiftCard && isError) || (!displayGiftCard && !isLoading)) {
        return <div className="flex justify-center items-center h-screen bg-gray-50 pt-16"><p className="text-xl text-red-500">Gift Card not found.</p></div>;
    }

    const handleBuyNow = () => {
        setIsBuying(true);
    };

    if (isBuying && displayGiftCard) {
        return (
            <div className="min-h-screen bg-gray-50 pb-12 pt-3">
                <div className="container mx-auto px-4 py-4">
                    <Button variant="ghost" onClick={() => setIsBuying(false)} className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Details
                    </Button>
                    <NewGiftCardFlow template={displayGiftCard} />
                </div>
            </div>
        )
    }

    const safeGC = displayGiftCard as any;
    const name = safeGC.name || safeGC.title || 'Gift Card';
    const description = safeGC.description || "No description available.";

    const images = (safeGC.media && safeGC.media.length > 0)
        ? safeGC.media
        : (safeGC.imageUrl
            ? [safeGC.imageUrl]
            : (safeGC.backgroundImageUrl
                ? [safeGC.backgroundImageUrl]
                : (safeGC.image ? [safeGC.image] : ['/placeholder.png'])));

    const promotionalItemFormat: PromotionalItem = {
        id: displayGiftCard.id,
        title: name,
        image: images[0] || '/placeholder.png',
        category: 'Gift Card',
        price: 0,
        items_left: 1,
        fixedAmounts: displayGiftCard.fixedAmounts,
        bonusAmount: displayGiftCard.bonusAmount,
        bonusThreshold: displayGiftCard.bonusThreshold,
        link: '#',
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 pt-3">
            <div className="bg-white border-b shadow-sm mb-6">
                <div className="container mx-auto px-4 h-14 flex items-center">
                    <Link href="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Listings
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Marketplace Style Gift Card Visual */}
                        <div className="flex justify-center items-center bg-gray-100/50 rounded-2xl p-8 border border-gray-100 w-full">
                            <div className="w-full max-w-[380px] pointer-events-none">
                                <GiftCardCard giftCard={promotionalItemFormat} viewMode="grid" hidePrice={true} />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{name}</h2>
                            <div className="text-sm font-medium text-gray-500 mb-6 pb-6 border-b border-gray-100 border-dashed inline-block w-full">
                                {displayGiftCard.expiryPeriodDays
                                    ? `Valid for ${displayGiftCard.expiryPeriodDays} days from purchase`
                                    : "No expiry date"}
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-800">About this card</h3>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2 transition-colors">
                                            View available brands and retailers
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Where to spend</DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4 space-y-4">
                                            {spendingLocations.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">No specific brands or retailers have been configured for this card yet.</p>
                                            ) : (
                                                <>
                                                    {spendingLocations.filter(loc => loc.type === 'Business').length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-gray-900 mb-2 border-b pb-1">Businesses</h4>
                                                            <ul className="space-y-1">
                                                                {spendingLocations.filter(loc => loc.type === 'Business').map(loc => (
                                                                    <li key={loc.id} className="text-sm text-gray-700 flex items-center">
                                                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
                                                                        {loc.label}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {spendingLocations.filter(loc => loc.type === 'Group Circle Contact').length > 0 && (
                                                        <div className="pt-2">
                                                            <h4 className="text-sm font-semibold text-gray-900 mb-2 border-b pb-1">Group Circle Contacts</h4>
                                                            <ul className="space-y-1">
                                                                {spendingLocations.filter(loc => loc.type === 'Group Circle Contact').map(loc => (
                                                                    <li key={loc.id} className="text-sm text-gray-700 flex items-center">
                                                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                                                        {loc.label}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
                        </div>

                        {/* Issued Card Info (if viewing by code) */}
                        {issuedData && (
                            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 md:p-8 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-8 h-8 opacity-90" />
                                        <h3 className="text-xl font-bold">Your Gift Card</h3>
                                    </div>
                                    <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                                        Balance Card
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-md">
                                        <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Current Balance</p>
                                        <p className="text-4xl font-black">£{Number(issuedData.currentBalance).toFixed(2)}</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Card Number</p>
                                            <p className="font-mono text-lg tracking-widest">{issuedData.code.replace(/(.{4})/g, '$1 ')}</p>
                                        </div>
                                        {issuedData.purchaseBusiness && (
                                            <div className="text-center sm:text-right">
                                                <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Issued By</p>
                                                <p className="font-bold">{issuedData.purchaseBusiness.businessName}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div className="sticky top-20 space-y-6">
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">Purchase Gift Card</h1>

                                {/* Bonus Offer Display */}
                                {displayGiftCard.bonusThreshold && displayGiftCard.bonusAmount && (
                                    <div className="mb-6 rounded-lg bg-green-50 p-3 border border-green-100">
                                        <p className="font-bold text-green-700 text-sm">🎉 Special Bonus Offer!</p>
                                        <p className="text-green-800 text-sm mt-1">
                                            Buy for <span className="font-bold">£{displayGiftCard.bonusThreshold}</span> or more and get an extra <span className="font-bold">£{displayGiftCard.bonusAmount}</span> free!
                                        </p>
                                    </div>
                                )}

                                {/* Pricing Options Display */}
                                <div className="mb-6">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Available Amounts:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {displayGiftCard.fixedAmounts?.map((amt) => (
                                            <span key={amt} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                £{amt}
                                            </span>
                                        ))}
                                        {displayGiftCard.allowCustomAmount && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                Custom (£{displayGiftCard.minCustomAmount} - £{displayGiftCard.maxCustomAmount})
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleBuyNow}>
                                    <ShoppingCart className="mr-2 h-5 w-5" /> Buy Now
                                </Button>
                            </div>
                            <ServiceSafetyCard />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
