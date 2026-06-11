'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Camera,
  Star,
  CheckCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useAddOffer } from '@/service/offers/hook';
import { CreateOfferDto } from '@/service/offers/types';

export default function CreateOfferPage() {
  const router = useRouter();
  const createOffer = useAddOffer();
  const [isSuccess, setIsSuccess] = useState(false);

  // Form fields
  const [offerType, setOfferType] = useState<'Discount' | 'Free Item' | 'Voucher' | 'Event Access'>('Discount');
  const [offerTitle, setOfferTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardCost, setRewardCost] = useState('500');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantityLimit, setQuantityLimit] = useState('');

  const types = ['Discount', 'Free Item', 'Voucher', 'Event Access'] as const;

  const getCouponType = (type: string) => {
    switch (type) {
      case 'Discount':
        return 'PERCENTAGE_DISCOUNT';
      case 'Free Item':
        return 'FREE_PRODUCTS';
      case 'Voucher':
        return 'FIXED_CART_DISCOUNT';
      case 'Event Access':
        return 'BONUS_POINTS';
      default:
        return 'PERCENTAGE_DISCOUNT';
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim()) return;

    const points = parseInt(rewardCost, 10) || 0;
    const limit = parseInt(quantityLimit, 10) || undefined;
    const expiry = expiryDate ? new Date(expiryDate) : undefined;

    const dataToSubmit: CreateOfferDto = {
      name: offerTitle,
      description: description,
      points: points,
      endDate: expiry,
      rewardCouponType: getCouponType(offerType),
      allowFreeShipping: false,
      individualUseOnly: false,
      excludeSaleItems: false,
      allowLimitToReset: false,
      includedProductIds: [],
      excludedProductIds: [],
      offerScope: 'ALL_LISTINGS',
      businessIds: [],
      discountPercentage: offerType === 'Discount' ? 20 : undefined,
      discountAmount: offerType === 'Voucher' ? 10 : undefined,
      limitPerCustomer: limit,
    };

    try {
      await createOffer.mutateAsync(dataToSubmit);
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to publish offer:', error);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccess(false);
    router.push('/dashboard/loyalty');
  };

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5] text-[#1f1b18]">
      <div className="max-w-md mx-auto px-4 pt-5 pb-36 space-y-6">

        {/* ── BACK NAVIGATION ── */}
        <div className="flex items-center">
          <Link 
            href="/dashboard/loyalty" 
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Loyalty
          </Link>
        </div>

        {/* ── HEADER ── */}
        <section>
          <h2 className="font-bold text-2xl text-gray-900 leading-tight">Create Redemption Offer</h2>
          <p className="text-xs text-gray-500 mt-1">
            Design a new reward to delight your loyal customers and drive repeat visits.
          </p>
        </section>

        {/* ── CREATE FORM BLOCK ── */}
        <form onSubmit={handlePublish} className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-4">
            
            {/* Offer Type Pills */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Offer Type</label>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {types.map((type) => {
                  const isActive = offerType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOfferType(type)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 duration-100 ${
                        isActive
                          ? 'bg-[#00629f] text-white shadow-sm'
                          : 'border border-[#e2bfb0] text-gray-500 hover:bg-gray-50 bg-white'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Offer Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Offer Title</label>
              <input
                type="text"
                required
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                placeholder="e.g., 20% Off Summer Collection"
                className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-medium placeholder:text-gray-400"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell your customers what they get and why it's special..."
                rows={3}
                className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-medium placeholder:text-gray-400 resize-none"
              />
            </div>

            {/* Reward Cost & Expiry Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Reward Cost (Points)</label>
                <input
                  type="number"
                  required
                  value={rewardCost}
                  onChange={(e) => setRewardCost(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-bold"
                />
              </div>
            </div>

            {/* Quantity Limit */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Quantity Limit</label>
              <input
                type="number"
                value={quantityLimit}
                onChange={(e) => setQuantityLimit(e.target.value)}
                placeholder="Total available (optional)"
                className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-medium"
              />
            </div>
          </div>

          {/* Offer Image Upload Box */}
          <div className="bg-white p-5 rounded-2xl border border-dashed border-[#e2bfb0] shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50/50 transition-colors py-8">
            <Camera className="w-8 h-8 text-[#a14000] mb-2" />
            <p className="font-bold text-xs text-gray-800">Click to upload image</p>
            <p className="text-[9px] text-gray-400 font-semibold mt-1">JPG, PNG or WEBP (Max 5MB)</p>
          </div>

          {/* Live Preview Card */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-gray-950">Preview Card</h3>
            
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f7ece7] relative"
            >
              <div className="h-44 bg-slate-100 relative">
                {/* Mock image fallback */}
                <img
                  alt="Preview"
                  src="https://lh3.googleusercontent.com/aida/AP1WRLtH66VWXb3rP7Q3V8B3awwyuBNCuMkEXl1bSM6T_KvNm8snGkln4MsJ6W91yQqVmj2jBn8Xa47JaovuZnZERl0CqNWeS1_8saOU01iTjJT8HWmJyv6eksf6F1YhdVCiuoctt0Z0U9QTTOc_QjYANctFNiB2uRd3n0NFlgDvUgYQXV2xYZduWfnw19pHZ3Zlq9g4pDI1ckkFK1aIzdXihlizFwSnlXRSAWYJaHJ4zW-vy3spJbiTzHc6Vw"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-orange-600 text-white">
                      {offerType}
                    </span>
                    {expiryDate && (
                      <span className="text-[9px] text-orange-200 font-bold">
                        Exp. {expiryDate}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-base mt-1.5 truncate">
                    {offerTitle.trim() || '20% Off Summer Sale'}
                  </h4>
                  <p className="text-[10px] text-orange-100 font-semibold mt-0.5">
                    {rewardCost || '500'} Points Required
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form CTAs */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="py-3.5 bg-white border border-[#e2bfb0] text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 active:scale-95 transition-all"
              >
                Preview
              </button>
              <button
                type="button"
                className="py-3.5 bg-[#fff8f5] border border-[#e2bfb0] text-[#a14000] rounded-xl font-bold text-xs hover:bg-orange-50 active:scale-95 transition-all"
              >
                Save Draft
              </button>
            </div>
            <button
              type="submit"
              disabled={createOffer.isPending || !offerTitle.trim()}
              className={`w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-1.5 transition-all ${
                !offerTitle.trim() || createOffer.isPending
                  ? 'bg-gray-300 shadow-none cursor-not-allowed'
                  : 'bg-[#a14000] hover:opacity-90 active:scale-95 shadow-orange-600/15 cursor-pointer'
              }`}
            >
              {createOffer.isPending ? 'Publishing...' : 'Publish Offer'}
            </button>
          </div>
        </form>

      </div>

      {/* ── SUCCESS MODAL DIALOG ── */}
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleSuccessClose}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            />

            {/* Content box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative z-10 border border-[#f7ece7]"
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 text-[#a14000] flex items-center justify-center mx-auto border border-orange-200">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 leading-tight">Offer Published!</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Your new redemption offer **{offerTitle}** is now active and can be redeemed by customers using their points.
                </p>
              </div>
              <button 
                onClick={handleSuccessClose}
                className="w-full py-2.5 bg-[#a14000] text-white rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                Go to Loyalty
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
