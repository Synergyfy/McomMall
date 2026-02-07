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
import { Sparkles, Zap, Timer } from 'lucide-react';

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
            className="group relative aspect-[1.58/1]"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 shadow-2xl border border-white/10 flex flex-col justify-between overflow-hidden">
                {/* Abstract pattern overlay */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                
                <div className="flex justify-between items-start">
                   <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                      <div className="flex items-center gap-2">
                        <Zap className="text-yellow-400 fill-yellow-400" size={16} />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Flash Coupon</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-black uppercase tracking-tighter">
                      <Timer size={14} /> Limited Time
                   </div>
                </div>

                <div className="text-center py-4">
                   <h3 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg mb-2">
                      {product.name}
                   </h3>
                   <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Unlock Exclusive Savings</p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-white">
                         <Sparkles size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Coupon Price</p>
                        <p className="text-2xl font-black text-white">{CURRENCY}{product.fixedAmounts?.[0] || '5'}</p>
                      </div>
                   </div>
                   
                   <Button 
                    onClick={() => handleBuyNow(product)}
                    className="h-14 px-8 bg-white text-indigo-600 hover:bg-yellow-400 hover:text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-black/20"
                   >
                     Buy Now
                   </Button>
                </div>

                {/* Corner cut-outs like a real ticket/coupon */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full hidden md:block" />
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full hidden md:block" />
             </div>
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