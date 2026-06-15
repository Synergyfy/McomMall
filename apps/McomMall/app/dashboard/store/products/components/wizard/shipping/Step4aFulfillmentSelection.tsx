"use client";

import React, { useState } from 'react';
import { Store, Truck, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  onSelect: (types: ('shipping' | 'pickup')[]) => void;
  onBack: () => void;
  initialSelected?: ('shipping' | 'pickup')[];
  allowedMethods?: ('shipping' | 'pickup')[];
}

export default function Step4aFulfillmentSelection({ onSelect, onBack, initialSelected, allowedMethods }: Props) {
  const [selectedMethods, setSelectedMethods] = useState<('shipping' | 'pickup')[]>(() => {
    if (initialSelected && initialSelected.length > 0) {
      const allowed = initialSelected.filter(m => !allowedMethods || allowedMethods.includes(m));
      return allowed.length > 0 ? allowed : (allowedMethods && allowedMethods.length > 0 ? [allowedMethods[0]] : ['pickup']);
    }
    return allowedMethods && allowedMethods.length > 0 ? [allowedMethods[0]] : ['pickup'];
  });

  const isPickupAllowed = !allowedMethods || allowedMethods.includes('pickup');
  const isShippingAllowed = !allowedMethods || allowedMethods.includes('shipping');

  const toggleMethod = (method: 'shipping' | 'pickup') => {
    if (method === 'pickup' && !isPickupAllowed) return;
    if (method === 'shipping' && !isShippingAllowed) return;

    setSelectedMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 md:pb-16">
      {/* Progress Bar */}
      <div className="w-full bg-white dark:bg-[#291e15] rounded-xl p-4 md:p-6 shadow-sm border border-[#e8dbce] dark:border-[#4a3b2f]">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex justify-between items-end">
            <span className="text-[#f48c25] text-xs md:text-sm font-bold uppercase tracking-wider">Step 4 of 8</span>
            <span className="text-[#1c140d] dark:text-white text-xs md:text-sm font-semibold">Fulfillment Selection</span>
          </div>
          <div className="relative w-full h-1.5 md:h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-[#f48c25] rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
        {/* Pickup Option (First) */}
        <div
          onClick={() => isPickupAllowed && toggleMethod('pickup')}
          className={`relative rounded-2xl border-2 p-6 transition-all duration-300 ${
            !isPickupAllowed
              ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
              : selectedMethods.includes('pickup')
                ? 'border-[#f48c25] bg-[#fff8f1] dark:bg-[#f48c25]/5 shadow-md cursor-pointer'
                : 'border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] hover:border-[#f48c25]/50 cursor-pointer'
          }`}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`p-4 rounded-full ${!isPickupAllowed ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : selectedMethods.includes('pickup') ? 'bg-[#f48c25] text-white' : 'bg-[#f4ede7] dark:bg-[#3a2e26] text-[#9c7349]'}`}>
              <Store size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1c140d] dark:text-white">In-Store Pickup</h3>
              <p className="text-sm text-[#9c7349] dark:text-[#cba885] mt-2 leading-relaxed">
                {isPickupAllowed
                  ? 'Customers collect items directly from your shop. Great for local traffic.'
                  : 'Not enabled for your business. You can enable this in store settings.'}
              </p>
            </div>
            {isPickupAllowed && selectedMethods.includes('pickup') && <CheckCircle2 className="absolute top-4 right-4 text-[#f48c25]" size={24} />}
          </div>
        </div>

        {/* Delivery Option (Second) */}
        <div
          onClick={() => isShippingAllowed && toggleMethod('shipping')}
          className={`relative rounded-2xl border-2 p-6 transition-all duration-300 ${
            !isShippingAllowed
              ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#2d241b]'
              : selectedMethods.includes('shipping')
                ? 'border-[#f48c25] bg-[#fff8f1] dark:bg-[#f48c25]/5 shadow-md cursor-pointer'
                : 'border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] hover:border-[#f48c25]/50 cursor-pointer'
          }`}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`p-4 rounded-full ${!isShippingAllowed ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : selectedMethods.includes('shipping') ? 'bg-[#f48c25] text-white' : 'bg-[#f4ede7] dark:bg-[#3a2e26] text-[#9c7349]'}`}>
              <Truck size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1c140d] dark:text-white">Delivery / Shipping</h3>
              <p className="text-sm text-[#9c7349] dark:text-[#cba885] mt-2 leading-relaxed">
                {isShippingAllowed
                  ? 'Ship products to customers worldwide. Best for physical goods sent via carriers.'
                  : 'Not enabled for your business. You can enable this in store settings.'}
              </p>
            </div>
            {isShippingAllowed && selectedMethods.includes('shipping') && <CheckCircle2 className="absolute top-4 right-4 text-[#f48c25]" size={24} />}
          </div>
        </div>
      </div>

      {/* Mobile-First Sticky-Free Footer */}
      <div className="relative p-4 bg-white dark:bg-[#1c140d] border-t border-[#e8dbce] dark:border-[#4a3b2e] md:relative md:bg-transparent md:border-none md:p-0 md:mt-8 w-full">
        <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="px-6 py-3.5 rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] text-[#1c140d] dark:text-white font-bold text-sm flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <button
            onClick={() => onSelect(selectedMethods)}
            disabled={selectedMethods.length === 0}
            className="flex-1 md:flex-none px-12 py-3.5 rounded-xl bg-[#f48c25] text-white font-bold text-sm shadow-lg shadow-[#f48c25]/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Next Step <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}