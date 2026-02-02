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
  const [deliveryType, setDeliveryType] = useState<'free' | 'paid'>(formData.deliveryPricingType || 'free');

  const handleSelection = (type: 'free' | 'paid') => {
    setDeliveryType(type);
    updateFormData({ deliveryPricingType: type });
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
          Choose the shipping model that best fits your business strategy.
        </p>
      </div>

      {/* Radius Based Logic - NEW */}
      <div className="mx-4 mb-8 bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-900/30">
          <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500 rounded-lg text-white">
                  <Navigation size={20} />
              </div>
              <h4 className="font-bold dark:text-white">Radius-Based Free Delivery</h4>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs font-bold text-[#9c7349] uppercase">Free Delivery Radius (Miles)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    className="w-full p-3 rounded-xl border border-orange-200 dark:bg-[#1c140d] dark:text-white focus:border-orange-500 outline-none"
                    value={formData.freeRadius || ""}
                    onChange={(e) => updateFormData({ freeRadius: e.target.value })}
                  />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs font-bold text-[#9c7349] uppercase">Charge Outside Radius (£)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10.00"
                    className="w-full p-3 rounded-xl border border-orange-200 dark:bg-[#1c140d] dark:text-white focus:border-orange-500 outline-none"
                    value={formData.outsideRadiusCharge || ""}
                    onChange={(e) => updateFormData({ outsideRadiusCharge: e.target.value })}
                  />
              </div>
          </div>
          <p className="text-[10px] text-[#9c7349] mt-3 italic">* Customers within {formData.freeRadius || 0} miles of your pickup locations will see Free Delivery.</p>
      </div>

      {/* Segmented Toggle */}
      <div className="flex px-4 py-3 max-w-md mx-auto w-full mb-6">
        <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#f4ede7] dark:bg-[#3d2f25] p-1.5 shadow-inner">
          <button
            onClick={() => handleSelection('free')}
            className={`flex h-full grow items-center justify-center rounded-lg px-2 text-sm font-bold transition-all duration-200 ${
              deliveryType === 'free' 
              ? 'bg-[#f48c25] text-white shadow-md shadow-orange-900/10' 
              : 'text-[#9c7349] dark:text-[#c4a687] hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            Free Delivery
          </button>
          <button
            onClick={() => handleSelection('paid')}
            className={`flex h-full grow items-center justify-center rounded-lg px-2 text-sm font-bold transition-all duration-200 ${
              deliveryType === 'paid' 
              ? 'bg-[#f48c25] text-white shadow-md shadow-orange-900/10' 
              : 'text-[#9c7349] dark:text-[#c4a687] hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            Paid Delivery
          </button>
        </div>
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {/* Free Delivery Card */}
        <div
          onClick={() => handleSelection('free')}
          className={`relative flex flex-col p-8 rounded-2xl border-2 transition-all duration-200 cursor-pointer group ${
            deliveryType === 'free'
              ? 'border-[#f48c25] bg-[#fff8f1] dark:bg-[#f48c25]/10 shadow-xl shadow-[#f48c25]/10 scale-[1.02]'
              : 'border-[#e8dbce] dark:border-[#3d2f25] bg-white dark:bg-[#2d2116] hover:border-[#f48c25]/50 hover:shadow-lg'
          }`}
        >
          <div className={`size-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${
            deliveryType === 'free' ? 'bg-[#f48c25] text-white' : 'bg-[#f4ede7] dark:bg-[#3d2f25] text-[#1c140d] dark:text-white'
          }`}>
            <Heart size={28} fill={deliveryType === 'free' ? "currentColor" : "none"} />
          </div>
          
          <h3 className="text-2xl font-bold mb-3 text-[#1c140d] dark:text-white">Free Delivery</h3>
          <p className="text-[#9c7349] dark:text-[#c4a687] text-base leading-relaxed mb-6">
            Boost sales by offering no-cost shipping. You cover the shipping costs, leading to higher conversion rates.
          </p>
          
          <div className={`mt-auto flex items-center gap-2 font-bold transition-opacity ${
            deliveryType === 'free' ? 'text-[#f48c25] opacity-100' : 'opacity-0'
          }`}>
            <span>Selected</span>
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Paid Delivery Card */}
        <div
          onClick={() => handleSelection('paid')}
          className={`relative flex flex-col p-8 rounded-2xl border-2 transition-all duration-200 cursor-pointer group ${
            deliveryType === 'paid'
              ? 'border-[#f48c25] bg-[#fff8f1] dark:bg-[#f48c25]/10 shadow-xl shadow-[#f48c25]/10 scale-[1.02]'
              : 'border-[#e8dbce] dark:border-[#3d2f25] bg-white dark:bg-[#2d2116] hover:border-[#f48c25]/50 hover:shadow-lg'
          }`}
        >
          <div className={`size-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${
            deliveryType === 'paid' ? 'bg-[#f48c25] text-white' : 'bg-[#f4ede7] dark:bg-[#3d2f25] text-[#1c140d] dark:text-white'
          }`}>
            <Truck size={28} />
          </div>
          
          <h3 className="text-2xl font-bold mb-3 text-[#1c140d] dark:text-white">Paid Delivery</h3>
          <p className="text-[#9c7349] dark:text-[#c4a687] text-base leading-relaxed mb-6">
            Charge customers based on weight, distance, or flat rates. Maintain your margins on lower-priced products.
          </p>
          
          <div className={`mt-auto flex items-center gap-2 font-bold transition-opacity ${
            deliveryType === 'paid' ? 'text-[#f48c25] opacity-100' : 'opacity-0'
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
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#f48c25] text-white font-bold text-sm shadow-lg shadow-[#f48c25]/20 hover:bg-[#e07b1a] hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}