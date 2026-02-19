'use client';

import { useState } from 'react';
import { useGetPublicCouponProductsByBusiness } from '@/service/coupon-products/hooks';
import { CouponProduct } from '@/service/coupon-products/types';
import { Button } from '@/components/ui/button';
import { CURRENCY } from '@/lib/utils';
import CouponPurchaseModal from './CouponPurchaseModal';
import { Coupon } from '@/service/my-coupons/types';
import CouponPaymentSuccessModal from '@/components/CouponPaymentSuccessModal';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CouponTicketFull } from '@/components/ui/CouponTicketCard';


interface CouponTabContentProps {
  businessId: string;
}

export default function CouponTabContent({
  businessId,
}: CouponTabContentProps) {
  const {
    data: couponProducts,
    isLoading,
    isError,
  } = useGetPublicCouponProductsByBusiness(businessId);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CouponProduct | null>(null);
  const [purchasedCoupon, setPurchasedCoupon] = useState<Coupon | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="aspect-[1.58/1] bg-gray-100 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  if (isError || !couponProducts || couponProducts.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
        <Sparkles className="mx-auto text-gray-300 mb-4" size={48} />
        <h4 className="text-xl font-black text-gray-900">No Active Coupons</h4>
        <p className="text-gray-500 font-bold text-sm mt-2">Check back soon for seasonal discounts and flash coupons.</p>
      </div>
    );
  }

  const handleBuyNow = (product: CouponProduct) => {
    setSelectedProduct(product);
    setIsPurchaseModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {couponProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <CouponTicketFull
              title={product.name}
              subtitle="Flash Coupon · Limited Time"
              valueLabel={`${CURRENCY}${product.fixedAmounts?.[0] || '5'}`}
              validUntil="LIMITED TIME"
              footerText="mcommall.com"
            >
              <Button
                onClick={() => handleBuyNow(product)}
                className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg"
              >
                Buy Now
              </Button>
            </CouponTicketFull>
          </motion.div>
        ))}
      </div>


      {selectedProduct && (
        <CouponPurchaseModal
          product={selectedProduct}
          isOpen={isPurchaseModalOpen}
          onClose={() => setSelectedProduct(null)}
          onPurchaseSuccess={(c) => { setSelectedProduct(null); setPurchasedCoupon(c); setIsSuccessModalOpen(true); }}
        />
      )}

      {purchasedCoupon && (
        <CouponPaymentSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => { setIsSuccessModalOpen(false); setPurchasedCoupon(null); }}
          couponCode={purchasedCoupon.code}
          recipientEmail={purchasedCoupon.recipientEmail}
        />
      )}
    </>
  );
}