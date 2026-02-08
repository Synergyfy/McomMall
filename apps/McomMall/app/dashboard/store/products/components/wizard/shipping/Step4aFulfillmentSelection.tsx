"use client";

import React, { useState } from 'react';
import { Store, Truck, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  onSelect: (types: ('shipping' | 'pickup')[]) => void;
  onBack: () => void;
}

export default function Step4aFulfillmentSelection({ onSelect, onBack }: Props) {
  const [selectedMethods, setSelectedMethods] = useState<('shipping' | 'pickup')[]>(['pickup']);

  const toggleMethod = (method: 'shipping' | 'pickup') => {
    setSelectedMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-32">
      {/* Progress Bar & Header */}
      <div className="flex flex-col gap-4">

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase text-[#1c140d] dark:text-white">
            <span>Step 4 of 8</span>
            <span>50%</span>
          </div>
          <div className="rounded-full bg-[#e8dbce] dark:bg-[#4a3b2e] h-2 overflow-hidden">
            <div className="h-full bg-[#f48c25] rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
        {/* Pickup Option (First) */}
        <div
          onClick={() => toggleMethod('pickup')}
          className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 ${selectedMethods.includes('pickup')
            ? 'border-[#f48c25] bg-[#fff8f1] dark:bg-[#f48c25]/5 shadow-md'
            : 'border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] hover:border-[#f48c25]/50'
            }`}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`p-4 rounded-full ${selectedMethods.includes('pickup') ? 'bg-[#f48c25] text-white' : 'bg-[#f4ede7] dark:bg-[#3a2e26] text-[#9c7349]'}`}>
              <Store size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1c140d] dark:text-white">In-Store Pickup</h3>
              <p className="text-sm text-[#9c7349] dark:text-[#cba885] mt-2 leading-relaxed">
                Customers collect items directly from your shop. Great for local traffic.
              </p>
            </div>
            {selectedMethods.includes('pickup') && <CheckCircle2 className="absolute top-4 right-4 text-[#f48c25]" size={24} />}
          </div>
        </div>

        {/* Delivery Option (Second) */}
        <div
          onClick={() => toggleMethod('shipping')}
          className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 ${selectedMethods.includes('shipping')
            ? 'border-[#f48c25] bg-[#fff8f1] dark:bg-[#f48c25]/5 shadow-md'
            : 'border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] hover:border-[#f48c25]/50'
            }`}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`p-4 rounded-full ${selectedMethods.includes('shipping') ? 'bg-[#f48c25] text-white' : 'bg-[#f4ede7] dark:bg-[#3a2e26] text-[#9c7349]'}`}>
              <Truck size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1c140d] dark:text-white">Delivery / Shipping</h3>
              <p className="text-sm text-[#9c7349] dark:text-[#cba885] mt-2 leading-relaxed">
                Ship products to customers worldwide. Best for physical goods sent via carriers.
              </p>
            </div>
            {selectedMethods.includes('shipping') && <CheckCircle2 className="absolute top-4 right-4 text-[#f48c25]" size={24} />}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#1c140d] border-t border-[#e8dbce] dark:border-[#4a3b2e] md:relative md:bg-transparent md:border-none md:p-0 md:mt-8">
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