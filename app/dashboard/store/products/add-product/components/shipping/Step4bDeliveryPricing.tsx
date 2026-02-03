"use client";

import React, { useState } from 'react';
import { Heart, Truck, CheckCircle2, ChevronRight, ArrowLeft, ArrowRight, Navigation } from 'lucide-react';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4bDeliveryPricing({ formData, updateFormData, onNext, onBack }: Props) {
  // Use initialized values or fall back to single type from legacy data
  const [isFree, setIsFree] = useState<boolean>(formData.isFreeDelivery || formData.deliveryPricingType === 'free');
  const [isPaid, setIsPaid] = useState<boolean>(formData.isPaidDelivery || formData.deliveryPricingType === 'paid');

  const toggleFree = () => {
    const nextValue = !isFree;
    setIsFree(nextValue);
    updateFormData({ isFreeDelivery: nextValue });
  };

  const togglePaid = () => {
    const nextValue = !isPaid;
    setIsPaid(nextValue);
    updateFormData({ isPaidDelivery: nextValue });
  };

  const handleContinue = () => {
    // Basic validation
    if (!isFree && !isPaid) {
      alert("Please select at least one delivery option.");
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col max-w-[960px] mx-auto flex-1 px-4 md:px-10 animate-in fade-in duration-500">

      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 p-4">
        <span className="text-[#9c7349] dark:text-[#c4a687] text-sm font-medium hover:text-[#f48c25] transition-colors cursor-pointer">Products</span>
        <ChevronRight size={14} className="text-[#9c7349]" />
        <span className="text-[#9c7349] dark:text-[#c4a687] text-sm font-medium hover:text-[#f48c25] transition-colors cursor-pointer">Create New Product</span>
        <ChevronRight size={14} className="text-[#9c7349]" />
        <span className="text-[#1c140d] dark:text-white text-sm font-bold">Delivery Pricing</span>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex gap-6 justify-between items-end">
          <p className="text-lg font-bold text-[#1c140d] dark:text-white">Product Creation Progress</p>
          <p className="text-sm font-bold text-[#1c140d] dark:text-white">Step 4b of 8</p>
        </div>
        <div className="rounded-full bg-[#e8dbce] dark:bg-[#3d2f25] overflow-hidden h-2.5">
          <div className="h-full rounded-full bg-[#f48c25] transition-all duration-500 shadow-[0_0_10px_rgba(244,140,37,0.4)]" style={{ width: '58%' }}></div>
        </div>
        <p className="text-[#9c7349] dark:text-[#c4a687] text-sm font-medium">Current: Delivery Pricing Strategy</p>
      </div>

      {/* Headline Text */}
      <div className="py-8 text-center">
        <h1 className="text-[#1c140d] dark:text-white tracking-tight text-3xl md:text-4xl font-black leading-tight px-4 mb-3">
          How would you like to handle delivery?
        </h1>
        <p className="text-[#9c7349] dark:text-[#c4a687] text-lg max-w-2xl mx-auto">
          Choose the shipping model that best fits your business strategy. You can select both.
        </p>
      </div>

      {/* Dynamic Inputs Based on Selection */}
      <div className="flex flex-col gap-6 px-4 mb-10">
        {isFree && (
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-900/30 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg text-white">
                <Navigation size={20} />
              </div>
              <h4 className="font-bold dark:text-white">Free Delivery Settings</h4>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#9c7349] uppercase">Free Delivery Radius (Miles)</label>
              <input
                type="number"
                placeholder="e.g. 5"
                className="w-full p-3 rounded-xl border border-orange-200 dark:bg-[#1c140d] dark:text-white focus:border-orange-500 outline-none"
                value={formData.freeDeliveryRadius || ""}
                onChange={(e) => updateFormData({ freeDeliveryRadius: e.target.value })}
              />
              <p className="text-[10px] text-[#9c7349] mt-1 italic">* Customers within {formData.freeDeliveryRadius || 0} miles will see Free Delivery.</p>
            </div>
          </div>
        )}

        {isPaid && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-900/30 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg text-white">
                <Truck size={20} />
              </div>
              <h4 className="font-bold dark:text-white">Paid Delivery Settings</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#9c7349] uppercase">Paid Delivery Radius (Miles)</label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  className="w-full p-3 rounded-xl border border-blue-200 dark:bg-[#1c140d] dark:text-white focus:border-blue-500 outline-none"
                  value={formData.paidDeliveryRadius || ""}
                  onChange={(e) => updateFormData({ paidDeliveryRadius: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#9c7349] uppercase">Delivery Fee (£)</label>
                <input
                  type="number"
                  placeholder="e.g. 15.00"
                  className="w-full p-3 rounded-xl border border-blue-200 dark:bg-[#1c140d] dark:text-white focus:border-blue-500 outline-none"
                  value={formData.paidDeliveryFee || ""}
                  onChange={(e) => updateFormData({ paidDeliveryFee: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {/* Free Delivery Card */}
        <div
          onClick={toggleFree}
          className={`relative flex flex-col p-8 rounded-2xl border-2 transition-all duration-200 cursor-pointer group ${isFree
              ? 'border-[#f48c25] bg-[#fff8f1] dark:bg-[#f48c25]/10 shadow-xl shadow-[#f48c25]/10 scale-[1.02]'
              : 'border-[#e8dbce] dark:border-[#3d2f25] bg-white dark:bg-[#2d2116] hover:border-[#f48c25]/50 hover:shadow-lg'
            }`}
        >
          <div className={`size-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${isFree ? 'bg-[#f48c25] text-white' : 'bg-[#f4ede7] dark:bg-[#3d2f25] text-[#1c140d] dark:text-white'
            }`}>
            <Heart size={28} fill={isFree ? "currentColor" : "none"} />
          </div>

          <h3 className="text-2xl font-bold mb-3 text-[#1c140d] dark:text-white">Free Delivery</h3>
          <p className="text-[#9c7349] dark:text-[#c4a687] text-base leading-relaxed mb-6">
            Boost sales by offering no-cost shipping within a specific radius. You cover the costs.
          </p>

          <div className={`mt-auto flex items-center gap-2 font-bold transition-all ${isFree ? 'text-[#f48c25] opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
            <span>Selected</span>
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Paid Delivery Card */}
        <div
          onClick={togglePaid}
          className={`relative flex flex-col p-8 rounded-2xl border-2 transition-all duration-200 cursor-pointer group ${isPaid
              ? 'border-[#f48c25] bg-[#fff8f1] dark:bg-[#f48c25]/10 shadow-xl shadow-[#f48c25]/10 scale-[1.02]'
              : 'border-[#e8dbce] dark:border-[#3d2f25] bg-white dark:bg-[#2d2116] hover:border-[#f48c25]/50 hover:shadow-lg'
            }`}
        >
          <div className={`size-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${isPaid ? 'bg-[#f48c25] text-white' : 'bg-[#f4ede7] dark:bg-[#3d2f25] text-[#1c140d] dark:text-white'
            }`}>
            <Truck size={28} />
          </div>

          <h3 className="text-2xl font-bold mb-3 text-[#1c140d] dark:text-white">Paid Delivery</h3>
          <p className="text-[#9c7349] dark:text-[#c4a687] text-base leading-relaxed mb-6">
            Charge customers based on distance radius for deliveries further out.
          </p>

          <div className={`mt-auto flex items-center gap-2 font-bold transition-all ${isPaid ? 'text-[#f48c25] opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
            <span>Selected</span>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between px-4 py-10 mt-8 border-t border-[#f4ede7] dark:border-[#3d2f25]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#e8dbce] dark:border-[#524438] font-bold text-[#1c140d] dark:text-white text-sm hover:bg-[#f4ede7] dark:hover:bg-[#3d2f25] transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#f48c25] text-white font-bold text-sm shadow-lg shadow-[#f48c25]/20 hover:bg-[#e07b1a] hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}