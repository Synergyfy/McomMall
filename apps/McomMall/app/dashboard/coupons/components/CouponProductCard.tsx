'use client';

import React from 'react';
import { CouponProduct } from '@/service/coupon-products/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ShieldCheck, Tag, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CURRENCY, stripHtmlText } from '@/lib/utils';

interface CouponProductCardProps {
  product: CouponProduct;
  onDelete: (productId: string) => void;
}

const VoucherBow = () => (
  <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 z-30 scale-75 pointer-events-none">
    <div className="relative w-24 h-16 flex items-center justify-center">
      {/* Bow Loops */}
      <div className="absolute -left-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-br from-red-500 to-red-900 rotate-[-15deg] shadow-lg" />
      <div className="absolute -right-2 w-12 h-12 border-[4px] border-red-700 rounded-full bg-gradient-to-bl from-red-500 to-red-900 rotate-[15deg] shadow-lg" />
      {/* Bow Knot */}
      <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 border-2 border-red-500 z-10 shadow-xl" />
      {/* Bow Tails */}
      <div className="absolute top-8 -left-3 w-8 h-10 bg-red-700 rounded-bl-3xl rotate-[-20deg] opacity-90" />
      <div className="absolute top-8 -right-3 w-8 h-10 bg-red-700 rounded-br-3xl rotate-[20deg] opacity-90" />
    </div>
  </div>
);

export function CouponProductCard({ product, onDelete }: CouponProductCardProps) {
  const router = useRouter();

  const cardName = product.name || 'McomMall Coupon';
  const businessName = product.user?.businessName || 'McomMall Premium';

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative aspect-[2.4/1] w-full transition-transform hover:scale-[1.01]"
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl border border-gray-100 flex bg-white">
          {/* Left Black Section */}
          <div className="w-[25%] bg-[#121212] relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-red-600 shadow-2xl border-4 border-white/20 flex flex-col items-center justify-center text-white z-10">
              <span className="font-black text-2xl italic leading-none">{CURRENCY}{Math.floor(Number(product.fixedAmounts?.[0] || 0))}</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80 text-center">VALUE<br />START</span>
            </div>
          </div>

          {/* Red Ribbon Strip */}
          <div className="absolute top-0 left-[23%] w-6 h-full bg-red-600 shadow-[2px_0_10px_rgba(0,0,0,0.3)] z-10" />

          {/* Red Bow Overlay */}
          <VoucherBow />

          {/* Right White Section */}
          <div className="flex-1 bg-white relative p-6 pl-16 flex flex-col justify-between">
            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
              <span className="text-9xl font-black italic -rotate-12 scale-150">GIFT</span>
            </div>

            {/* Top Brand Info */}
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-red-600 rounded-sm shadow-sm" />
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight leading-none">{cardName}</span>
                  <span className="text-[7.5px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">{businessName}</span>
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400 border border-gray-100 flex items-center gap-1">
                <ShieldCheck size={12} />
                <span className="text-[7px] font-black uppercase tracking-tighter">Verified</span>
              </div>
            </div>

            {/* Main Title Area */}
            <div className="text-center py-0.5 relative z-10">
              <h2 className="text-5xl font-black text-gray-900 tracking-[-0.06em] uppercase italic leading-[0.85]">
                COUPON
              </h2>
              <p className="text-[8px] text-gray-400 font-bold mt-1 max-w-[280px] mx-auto leading-relaxed uppercase tracking-wider line-clamp-2">
                {stripHtmlText(product.description) || 'This voucher is applicable for all premium services and products across our platform.'}
              </p>
            </div>

            {/* Bottom Info */}
            <div className="flex items-end justify-between relative z-10">
              <div className="flex flex-col gap-1">
                <div className="px-5 py-1.5 rounded-full border-2 border-gray-900 text-gray-900 font-black uppercase tracking-[0.15em] text-[8px]">
                  PREVIEW ONLY
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                {product.expiryDays && (
                  <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 flex items-center gap-1">
                    <Clock size={8} /> {product.expiryDays} Days Validity
                  </span>
                )}
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">
                  {product.isEnabled ? 'ACTIVE PRODUCT' : 'INACTIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => router.push(`/dashboard/coupons/products/edit/${product.id}`)}
          variant="outline"
          className="flex-1 h-12 rounded-[1.25rem] border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all font-black uppercase text-[10px] tracking-widest shadow-sm"
        >
          <Edit size={18} className="mr-2" /> Edit Template
        </Button>
        <Button
          onClick={() => onDelete(product.id)}
          variant="outline"
          className="h-12 w-12 p-0 rounded-[1.25rem] border-gray-200 hover:border-red-600 hover:text-red-600 transition-all shadow-sm"
        >
          <Trash2 size={18} />
        </Button>
      </div>
    </div>
  );
}
