"use client";

import React from 'react';
import { StepHeader } from '../lib/StepHeader';
import { StepFooter } from '../lib/StepFooter';
import { 
  Truck, 
  Link as LinkIcon, 
  PackageCheck, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';

interface Step4Props {
  onSelectOption: (option: 'existing' | 'shipstation') => void;
  onBack: () => void;
  onSkip?: () => void;
}

export default function Step4ShippingOptions({ onSelectOption, onBack, onSkip }: Step4Props) {
  return (
    <div className="flex flex-col max-w-5xl mx-auto px-4 md:px-0">
      <StepHeader 
        step="Step 4b"
        title="Shipping Integration"
        description="Choose how you want to handle shipping for this product. Link your existing carrier accounts or use our partner integration for better rates."
        progress={83}
        nextStepLabel="Select Provider"
      />

      {/* Selection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        
        {/* Card 1: Existing Carriers */}
        <div 
          className="group relative flex flex-col rounded-2xl border-2 border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] p-8 pointer-events-none grayscale opacity-60"
        >
          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="bg-gray-800 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transform -rotate-2">Coming Soon</span>
          </div>

          <div className="absolute top-6 right-6 text-[#9c7349]">
            <Truck size={32} strokeWidth={1.5} />
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="px-2 py-1 rounded bg-[#f4ede7] dark:bg-[#3d2e21] text-[10px] font-bold text-[#9c7349] uppercase tracking-widest">FedEx</div>
            <div className="px-2 py-1 rounded bg-[#f4ede7] dark:bg-[#3d2e21] text-[10px] font-bold text-[#9c7349] uppercase tracking-widest">UPS</div>
            <div className="px-2 py-1 rounded bg-[#f4ede7] dark:bg-[#3d2e21] text-[10px] font-bold text-[#9c7349] uppercase tracking-widest">DHL</div>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            <h2 className="text-[#1c140d] dark:text-white text-xl font-bold leading-tight">Connect Existing Carriers</h2>
            <p className="text-[#594a3d] dark:text-[#cba885]/80 text-base font-normal leading-relaxed">
              Use your own negotiated rates. Perfect if you have high-volume contracts directly with major carriers.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-[#f48c25] font-bold text-sm">
            Configure Carriers <ChevronRight size={16} />
          </div>
        </div>

        {/* Card 2: ShipStation */}
        <div 
          onClick={() => onSelectOption('shipstation')}
          className="group relative flex flex-col rounded-2xl border-2 border-transparent bg-white dark:bg-[#2d241b] p-8 shadow-sm ring-2 ring-[#e8dbce] dark:ring-[#4a3b2e] cursor-pointer hover:ring-[#f48c25] hover:shadow-2xl transition-all duration-300"
        >
          {/* Recommended Badge */}
          <div className="absolute -top-3 left-8 bg-[#f48c25] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.1em] shadow-lg shadow-[#f48c25]/20">
            Recommended
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="text-[#f48c25]" size={28} />
              <span className="text-xl font-black text-[#1c140d] dark:text-white tracking-tighter">ShipStation</span>
            </div>
            <ShieldCheck className="text-[#f48c25]/40 group-hover:text-[#f48c25] transition-colors" size={24} />
          </div>

          <div className="flex flex-col gap-3 flex-1">
            <h2 className="text-[#1c140d] dark:text-white text-xl font-bold leading-tight">Power with ShipStation</h2>
            <p className="text-[#594a3d] dark:text-[#cba885]/80 text-base font-normal leading-relaxed">
              Automate label printing and access pre-negotiated rates up to 40% off. Advanced scaling for growing shops.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 bg-[#f48c25] text-white w-fit px-6 py-2 rounded-xl font-bold text-sm shadow-md group-hover:brightness-110 transition-all">
            <LinkIcon size={16} /> Connect Account
          </div>
        </div>
      </div>

      <StepFooter 
        onBack={onBack} 
        onSkip={onSkip} 
        showSkip={true} 
      />
    </div>
  );
}