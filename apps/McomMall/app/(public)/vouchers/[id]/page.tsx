'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetPublicVoucherProductDetails, useGetPublicVoucherDetails } from '@/service/vouchers/hook';
import { Loader, ChevronLeft, ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ServiceSafetyCard from '@/app/(public)/services/[id]/components/ServiceSafetyCard';
import ServiceGallery from '@/app/(public)/services/[id]/components/ServiceGallery';
import { useMarketplaceContext } from '@/context/MarketplaceContext';
import VoucherPurchaseModal from '@/app/(public)/listings/[id]/components/VoucherPurchaseModal';
import VoucherPaymentSuccessModal from '@/components/VoucherPaymentSuccessModal';
import { Voucher, VoucherProduct } from '@/service/vouchers/types';
import VoucherCard from '@/components/marketplace/VoucherCard';
import { PromotionalItem } from '@/lib/listing-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect } from 'react';

export default function VoucherPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const { selectedItem } = useMarketplaceContext();
    const cachedItem = selectedItem && String(selectedItem.id) === String(id) ? selectedItem : null;

    // Detect if ID is a code (8 chars or non-uuid)
    const isPossiblyCode = !!(id?.length && !id.includes('-'));

    const { data: productData, isLoading: productLoading, isError: productError } = useGetPublicVoucherProductDetails(id || '', {
        enabled: !cachedItem && !isPossiblyCode
    });

    const { data: issuedData, isLoading: issuedLoading, isError: issuedError } = useGetPublicVoucherDetails(id || '', {
        enabled: !cachedItem && isPossiblyCode
    });

    const displayVoucher = (cachedItem || productData || issuedData?.voucherProduct) as unknown as VoucherProduct;
    const isLoading = productLoading || issuedLoading;
    const isError = isPossiblyCode ? issuedError : productError;

    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [purchasedVoucher, setPurchasedVoucher] = useState<Voucher | null>(null);

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

    if (isLoading && !cachedItem) {
        return <div className="flex justify-center items-center h-screen bg-gray-50 pt-16"><Loader className="animate-spin text-orange-600" size={48} /></div>;
    }

    if ((!displayVoucher && isError) || (!displayVoucher && !isLoading && !cachedItem)) {
        return <div className="flex justify-center items-center h-screen bg-gray-50 pt-16"><p className="text-xl text-red-500">Voucher not found.</p></div>;
    }

    const handleBuyNow = () => {
        setIsPurchaseModalOpen(true);
    };

    const handlePurchaseSuccess = (voucher: Voucher) => {
        setIsPurchaseModalOpen(false);
        setPurchasedVoucher(voucher);
        setIsSuccessModalOpen(true);
    };

    const handleClosePurchaseModal = () => {
        setIsPurchaseModalOpen(false);
    };

    const handleCloseSuccessModal = () => {
        setIsSuccessModalOpen(false);
        setPurchasedVoucher(null);
    };

    // Safe property access
    const title = displayVoucher.name || (cachedItem as any)?.title || 'Voucher';
    // Check if fixedAmounts exist or default to price/amount
    const amountDisplay = displayVoucher.fixedAmounts?.length
        ? `From £${Math.min(...displayVoucher.fixedAmounts)}`
        : (displayVoucher.minCustomAmount ? `Custom Amount` : `£${(cachedItem as any)?.price || 0}`);

    const status = displayVoucher.isEnabled === false ? 'Unavailable' : 'Available';

    const images = (displayVoucher.media && displayVoucher.media.length > 0)
        ? displayVoucher.media
        : (displayVoucher.backgroundImage
            ? [displayVoucher.backgroundImage]
            : ((displayVoucher as any).image ? [(displayVoucher as any).image] : ['/placeholder.png']));

    const promotionalItemFormat: PromotionalItem = {
        id: displayVoucher?.id || '',
        title: title,
        image: images[0] || '/placeholder.png',
        category: 'Voucher',
        price: (displayVoucher as any)?.price || 0,
        items_left: 1,
        fixedAmounts: displayVoucher?.fixedAmounts,
        bonusAmount: displayVoucher?.bonusAmount,
        bonusThreshold: displayVoucher?.bonusThreshold,
        link: '#',
        expiryDate: displayVoucher?.expiryDays?.toString()
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 pt-3">
            {/* Navigation */}
            <div className="bg-white border-b shadow-sm mb-6">
                <div className="container mx-auto px-4 h-14 flex items-center">
                    <Link href="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Listings
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-center items-center bg-gray-100/50 rounded-2xl p-8 border border-gray-100 w-full">
                            <div className="w-full max-w-[380px] pointer-events-none">
                                <VoucherCard voucher={promotionalItemFormat} viewMode="grid" type="vouchers" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Voucher Details</h2>
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
                                                <p className="text-sm text-gray-500 italic">No specific brands or retailers have been configured for this voucher yet.</p>
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
                            <p className="text-gray-700">Name: <span className="font-bold">{title}</span></p>
                            <p className="text-gray-700">Value: {amountDisplay}</p>
                            {displayVoucher.description && <p className="text-gray-600 mt-2">{displayVoucher.description}</p>}
                        </div>

                        {/* Issued Voucher Info (if viewing by code) */}
                        {issuedData && (
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 md:p-8 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-8 h-8 opacity-90" />
                                        <h3 className="text-xl font-bold">Your Electronic Voucher</h3>
                                    </div>
                                    <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                                        Active Voucher
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-md">
                                        <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Current Balance</p>
                                        <p className="text-4xl font-black">£{Number(issuedData.balance).toFixed(2)}</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Voucher Code</p>
                                            <p className="font-mono text-lg tracking-widest">{issuedData.code}</p>
                                        </div>
                                        {(issuedData as any)?.user?.businesses?.[0] && (
                                            <div className="text-center sm:text-right">
                                                <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Issued By</p>
                                                <p className="font-bold">{(issuedData as any).user.businesses[0].businessName}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="relative">
                        <div className="sticky top-20 space-y-6">
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">Purchase Voucher</h1>

                                {/* Bonus Offer Display */}
                                {displayVoucher.bonusThreshold && displayVoucher.bonusAmount && (
                                    <div className="mb-6 rounded-lg bg-green-50 p-3 border border-green-100">
                                        <p className="font-bold text-green-700 text-sm">🎉 Special Bonus Offer!</p>
                                        <p className="text-green-800 text-sm mt-1">
                                            Buy for <span className="font-bold">£{displayVoucher.bonusThreshold}</span> or more and get an extra <span className="font-bold">£{displayVoucher.bonusAmount}</span> free!
                                        </p>
                                    </div>
                                )}

                                {/* Pricing Options Display */}
                                <div className="mb-6">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Available Amounts:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {displayVoucher.fixedAmounts?.map((amt) => (
                                            <span key={amt} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                £{amt}
                                            </span>
                                        ))}
                                        {displayVoucher.allowCustomAmount && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                Custom (£{displayVoucher.minCustomAmount} - £{displayVoucher.maxCustomAmount})
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-3xl font-bold text-orange-600 mb-6">{amountDisplay}</div>
                                <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleBuyNow}>
                                    <ShoppingCart className="mr-2 h-5 w-5" /> Buy Now
                                </Button>
                            </div>
                            <ServiceSafetyCard />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {/* We need full voucherProduct for the modal. If cachedItem is all we have, modal might break if it relies on specific fields like id, fixedAmounts etc. 
            Ideally useGetVoucherProduct fetches quickly. If not, we block or show loader in modal? 
            The modal expects 'product' prop. */}
            {displayVoucher && (
                <VoucherPurchaseModal
                    product={displayVoucher}
                    isOpen={isPurchaseModalOpen}
                    onClose={handleClosePurchaseModal}
                    onPurchaseSuccess={handlePurchaseSuccess}
                />
            )}

            {purchasedVoucher && (
                <VoucherPaymentSuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={handleCloseSuccessModal}
                    voucherCode={purchasedVoucher.code}
                    recipientEmail={purchasedVoucher.recipientEmail}
                />
            )}
        </div>
    );
}
