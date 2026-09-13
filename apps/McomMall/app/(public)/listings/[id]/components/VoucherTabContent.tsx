'use client';

import { useState } from 'react';
import { useGetBusinessVoucherProducts } from '@/service/hooks/useVoucherService';
import { VoucherProduct, Voucher } from '@/service/vouchers/types';
import { Button } from '@/components/ui/button';
import { CURRENCY, stripHtmlText } from '@/lib/utils';
import VoucherPurchaseModal from './VoucherPurchaseModal';
import VoucherPaymentSuccessModal from '@/components/VoucherPaymentSuccessModal';
import { motion } from 'framer-motion';
import { Ticket, Sparkles, Tag } from 'lucide-react';

interface VoucherTabContentProps {
  businessId: string;
}

export default function VoucherTabContent({
  businessId,
}: VoucherTabContentProps) {
  const {
    voucherProducts,
    isLoading,
    isError,
  } = useGetBusinessVoucherProducts(businessId);
  
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<VoucherProduct | null>(null);
  const [purchasedVoucher, setPurchasedVoucher] = useState<Voucher | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="aspect-[1.58/1] bg-gray-100 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  if (isError || !voucherProducts || voucherProducts.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
        <Ticket className="mx-auto text-gray-300 mb-4" size={48} />
        <h4 className="text-xl font-black text-gray-900">No Vouchers Found</h4>
        <p className="text-gray-500 font-bold text-sm mt-2">Currently, there are no special vouchers available.</p>
      </div>
    );
  }

  const handleBuyNow = (product: VoucherProduct) => {
    setSelectedProduct(product);
    setIsPurchaseModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {voucherProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative aspect-[1.58/1]"
          >
             <div className="absolute inset-0 bg-[#F5F5F5] rounded-[2.5rem] p-8 flex flex-col justify-between border-2 border-dashed border-gray-200 group-hover:border-[#f58220] transition-all overflow-hidden">
                {/* Visual accents */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start">
                   <div>
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-3 block">Official Voucher</span>
                      <h3 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h3>
                      <p className="text-gray-500 text-xs font-bold mt-2 max-w-[200px]">{stripHtmlText(product.description) || 'Valid for all services and products.'}</p>
                   </div>
                   <div className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                      <Tag className="text-[#f58220]" size={24} />
                   </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Starting From</span>
                      <p className="text-3xl font-black text-gray-900">{CURRENCY}{product.fixedAmounts?.[0] || '10'}</p>
                   </div>
                   <Button 
                    onClick={() => handleBuyNow(product)}
                    className="h-14 px-10 bg-black text-white hover:bg-[#f58220] font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-black/10"
                   >
                     Buy Now
                   </Button>
                </div>

                {/* Bonus Badge */}
                {product.bonusAmount && (
                  <div className="absolute top-8 right-8 rotate-12 translate-x-4 -translate-y-4 group-hover:rotate-0 group-hover:translate-x-0 group-hover:translate-y-0 transition-all">
                     <div className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg">
                        +{CURRENCY}{product.bonusAmount}
                     </div>
                  </div>
                )}
             </div>
          </motion.div>
        ))}
      </div>

      {selectedProduct && (
        <VoucherPurchaseModal
          product={selectedProduct}
          isOpen={isPurchaseModalOpen}
          onClose={() => setSelectedProduct(null)}
          onPurchaseSuccess={(v) => { setSelectedProduct(null); setPurchasedVoucher(v); setIsSuccessModalOpen(true); }}
        />
      )}

      {purchasedVoucher && (
        <VoucherPaymentSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => { setIsSuccessModalOpen(false); setPurchasedVoucher(null); }}
          voucherCode={purchasedVoucher.code}
          recipientEmail={purchasedVoucher.recipientEmail}
        />
      )}
    </>
  );
}
