'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader, ChevronLeft, ShoppingCart, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ServiceSafetyCard from '@/app/(public)/services/[id]/components/ServiceSafetyCard';
import ServiceGallery from '@/app/(public)/services/[id]/components/ServiceGallery';
import { useMarketplaceContext } from '@/context/MarketplaceContext';
import CouponPurchaseModal from '@/app/(public)/listings/[id]/components/CouponPurchaseModal';
import CouponPaymentSuccessModal from '@/components/CouponPaymentSuccessModal';
import { CouponProduct } from '@/service/coupon-products/types';
import { Coupon } from '@/service/my-coupons/types';
import { useGetPublicCouponProductDetails, useGetPublicCouponDetails } from '@/service/coupon-products/hooks';
import { PromotionalItem } from '@/lib/listing-data';
import VoucherCard from '@/components/marketplace/VoucherCard';

export default function CouponPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const { selectedItem } = useMarketplaceContext();
    const cachedItem = (selectedItem && String(selectedItem.id) === String(id) ? selectedItem : null) as unknown as CouponProduct;

    // Detect if ID is a code (assume non-uuid characters or specific logic)
    const isPossiblyCode = !!(id?.length && !id.includes('-')); // Rough check for non-uuid

    const { data: productData, isLoading: productLoading, isError: productError } = useGetPublicCouponProductDetails(id || '', {
        enabled: !isPossiblyCode
    });

    const { data: couponDetail, isLoading: couponDetailLoading, isError: couponDetailError } = useGetPublicCouponDetails(id || '', {
        enabled: isPossiblyCode
    });

    const displayCoupon = cachedItem || productData || couponDetail;
    const isLoading = productLoading || couponDetailLoading;
    const isError = productError && couponDetailError;

    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [purchasedCoupon, setPurchasedCoupon] = useState<Coupon | null>(null);

    if (!displayCoupon && isLoading) {
        return <div className="flex justify-center items-center h-screen bg-gray-50 pt-16"><Loader className="animate-spin text-orange-600" size={48} /></div>;
    }

    if ((!displayCoupon && isError) || (!displayCoupon && !isLoading)) {
        return <div className="flex justify-center items-center h-screen bg-gray-50 pt-16"><p className="text-xl text-red-500">Coupon not found.</p></div>;
    }

    const handleBuyNow = () => {
        setIsPurchaseModalOpen(true);
    };

    const handlePurchaseSuccess = (coupon: Coupon) => {
        setIsPurchaseModalOpen(false);
        setPurchasedCoupon(coupon);
        setIsSuccessModalOpen(true);
    };

    const handleClosePurchaseModal = () => {
        setIsPurchaseModalOpen(false);
    };

    const handleCloseSuccessModal = () => {
        setIsSuccessModalOpen(false);
        setPurchasedCoupon(null);
    };

    const title = displayCoupon.name || (displayCoupon as any).title || 'Coupon';
    const description = displayCoupon.description || (displayCoupon as any).couponDescription || "No description.";

    const discountDisplay = (displayCoupon as any).discountType
        ? ((displayCoupon as any).discountType === 'percentage' ? `${(displayCoupon as any).couponAmount}%` : `£${(displayCoupon as any).couponAmount}`)
        : ((displayCoupon as any).price ? `Value: £${(displayCoupon as any).price}` : 'Special Offer');

    const codeDisplay = (displayCoupon as any).couponCode || (cachedItem ? 'Login to view code' : 'N/A');

    const images = (displayCoupon as any).media && (displayCoupon as any).media.length > 0
        ? (displayCoupon as any).media
        : (displayCoupon.backgroundImage
            ? [displayCoupon.backgroundImage]
            : ((displayCoupon as any).imageUrl ? [(displayCoupon as any).imageUrl] : ['/placeholder.png']));

    const promotionalItemFormat: PromotionalItem = {
        id: displayCoupon?.id || '',
        title: title,
        image: images[0] || '/placeholder.png',
        category: 'Coupon',
        price: (displayCoupon as any)?.price || 0,
        items_left: 1,
        fixedAmounts: displayCoupon?.fixedAmounts ?? undefined,
        bonusAmount: displayCoupon?.bonusAmount ?? undefined,
        bonusThreshold: displayCoupon?.bonusThreshold ?? undefined,
        link: '#',
        expiryDate: displayCoupon?.expiryDays?.toString()
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
                        <div className="flex justify-center items-center bg-gray-100/50 rounded-2xl p-8 border border-gray-100 w-full">
                            <div className="w-full max-w-[380px] pointer-events-none">
                                <VoucherCard voucher={promotionalItemFormat} viewMode="grid" type="coupons" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Coupon Offer</h2>
                            <p className="text-gray-700">{description}</p>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Discount</p>
                                    <p className="font-semibold">{discountDisplay}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Code</p>
                                    <p className="font-mono font-bold bg-gray-100 inline-block px-2 py-1 rounded">{codeDisplay}</p>
                                </div>
                            </div>
                        </div>

                        {/* Issued Coupon Info (if viewing by code) */}
                        {couponDetail && (
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 md:p-8 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Ticket className="w-8 h-8 opacity-90" />
                                        <h3 className="text-xl font-bold">Your Discount Coupon</h3>
                                    </div>
                                    <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                                        {couponDetail.status}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-md">
                                        <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Coupon Code</p>
                                        <p className="text-4xl font-black tracking-widest uppercase">{couponDetail.code}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Discount</p>
                                            <p className="font-bold text-lg">
                                                {couponDetail.discountType === 'percentage' ? `${couponDetail.discountValue}%` : `£${couponDetail.discountValue}`} Off
                                            </p>
                                        </div>
                                        {couponDetail.expiresAt && (
                                            <div className="text-right">
                                                <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Expires On</p>
                                                <p className="font-bold text-lg">{new Date(couponDetail.expiresAt).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>

                                    {couponDetail.business && (
                                        <div className="pt-4 border-t border-white/10">
                                            <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Valid at</p>
                                            <p className="font-bold">{couponDetail.business.businessName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div className="sticky top-20 space-y-6">
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">Claim Offer</h1>

                                {/* Bonus Offer Display */}
                                {displayCoupon.bonusThreshold && displayCoupon.bonusAmount && (
                                    <div className="mb-6 rounded-lg bg-green-50 p-3 border border-green-100">
                                        <p className="font-bold text-green-700 text-sm">🎉 Special Bonus Offer!</p>
                                        <p className="text-green-800 text-sm mt-1">
                                            Buy for <span className="font-bold">£{displayCoupon.bonusThreshold}</span> or more and get an extra <span className="font-bold">£{displayCoupon.bonusAmount}</span> free!
                                        </p>
                                    </div>
                                )}

                                {/* Pricing Options Display */}
                                <div className="mb-6">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Available Amounts:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {displayCoupon.fixedAmounts?.map((amt) => (
                                            <span key={amt} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                £{amt}
                                            </span>
                                        ))}
                                        {displayCoupon.allowCustomAmount && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                Custom (£{displayCoupon.minCustomAmount} - £{displayCoupon.maxCustomAmount})
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

            {/* Modals */}
            {displayCoupon && (
                <CouponPurchaseModal
                    product={displayCoupon}
                    isOpen={isPurchaseModalOpen}
                    onClose={handleClosePurchaseModal}
                    onPurchaseSuccess={handlePurchaseSuccess}
                />
            )}

            {purchasedCoupon && (
                <CouponPaymentSuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={handleCloseSuccessModal}
                    couponCode={purchasedCoupon.code}
                    recipientEmail={purchasedCoupon.recipientEmail}
                />
            )}
        </div>
    );
}