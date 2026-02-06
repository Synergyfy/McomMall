'use client';

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetCoupon } from '@/service/coupons/hook';
import { Loader, ChevronLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ServiceSafetyCard from '@/app/(public)/services/[id]/components/ServiceSafetyCard';
import ServiceGallery from '@/app/(public)/services/[id]/components/ServiceGallery';
import { useMarketplaceContext } from '@/context/MarketplaceContext';
import CouponPurchaseModal from '@/app/(public)/listings/[id]/components/CouponPurchaseModal';
import CouponPaymentSuccessModal from '@/components/CouponPaymentSuccessModal';
import { CouponProduct } from '@/service/coupon-products/types';
import { Coupon } from '@/service/my-coupons/types';

export default function CouponPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { selectedItem } = useMarketplaceContext();
  const cachedItem = selectedItem && String(selectedItem.id) === String(id) ? selectedItem : null;

  // useGetCoupon returns 'coupon' which matches Coupon/CouponProduct structure
  const { coupon, isLoading, isError } = useGetCoupon(id || '', !cachedItem);

  const displayCoupon = (cachedItem || coupon) as unknown as CouponProduct;

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
  
  const title = displayCoupon.name || (displayCoupon as any).title || displayCoupon.couponCode || 'Coupon';
  const description = displayCoupon.description || displayCoupon.couponDescription || "No description.";
  
  const discountDisplay = displayCoupon.discountType 
    ? (displayCoupon.discountType === 'percentage' ? `${displayCoupon.couponAmount}%` : `£${displayCoupon.couponAmount}`)
    : (displayCoupon.price ? `Value: £${displayCoupon.price}` : 'Special Offer');

  const codeDisplay = displayCoupon.couponCode || (cachedItem ? 'Login to view code' : 'N/A');

  const images = (displayCoupon.media && displayCoupon.media.length > 0)
    ? displayCoupon.media
    : (displayCoupon.imageUrl 
        ? [displayCoupon.imageUrl] 
        : ((displayCoupon as any).image ? [(displayCoupon as any).image] : ['/placeholder.png']));

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
                    <ServiceGallery images={images} title={title} />
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
