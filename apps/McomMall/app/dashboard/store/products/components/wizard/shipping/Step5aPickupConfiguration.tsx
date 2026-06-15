"use client";

import React, { useState } from 'react';
import { MapPin, Info, ArrowLeft, CheckCircle, Plus, Edit2, Navigation, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step5aPickupConfiguration({ formData, updateFormData, onNext, onBack }: Props) {
  const [view, setView] = useState<'overview' | 'manage'>('overview');
  const [instructions, setInstructions] = useState(formData.pickupInstructions || "");
  const [showTooltip, setShowTooltip] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
      postcode: '',
      street: '',
      city: '',
      state: '',
      country: '',
      nickname: ''
  });

  const handleFetch = () => {
      // Mock fetch implementation
      setAddressDetails(prev => ({
          ...prev,
          city: 'London',
          state: 'Greater London',
          country: 'United Kingdom',
          street: '123 High Street' // Mock street too if needed, or keep existing
      }));
      toast.success("Address details fetched successfully!");
  };

  const handleFinish = () => {
    updateFormData({ pickupInstructions: instructions });
    onNext();
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 md:pb-16">
      {/* Progress Bar */}
      <div className="w-full bg-white dark:bg-[#291e15] rounded-xl p-4 md:p-6 shadow-sm border border-[#e8dbce] dark:border-[#4a3b2f]">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex justify-between items-end">
            <span className="text-[#f48c25] text-xs md:text-sm font-bold uppercase tracking-wider">Step 5 of 8</span>
            <span className="text-[#1c140d] dark:text-white text-xs md:text-sm font-semibold">Pickup Configuration</span>
          </div>
          <div className="relative w-full h-1.5 md:h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-[#f48c25] rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>

      {/* Header & Progress */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[#1c140d] dark:text-white text-2xl md:text-4xl font-black">
              {view === 'overview' ? 'Pickup Locations' : 'Add New Location'}
            </h1>
            {/* Info Tooltip */}
            <div className="relative">
              <button 
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-[#9c7349] hover:text-[#f48c25] transition-colors"
                type="button"
              >
                <HelpCircle size={20} />
              </button>
              
              {showTooltip && (
                <div className="absolute z-50 left-0 mt-2 w-72 p-4 bg-[#2d241b] text-white text-xs rounded-xl shadow-xl border border-[#4a3b2e] leading-relaxed">
                  <p className="font-bold mb-1 text-[#f48c25]">Why add multiple addresses?</p>
                  Some businesses operate from multiple branches, warehouses, or pop-up spots. 
                  Adding different locations allows customers to choose the pickup point closest to them at checkout.
                  <div className="absolute -top-1 left-2 w-2 h-2 bg-[#2d241b] rotate-45"></div>
                </div>
              )}
            </div>
          </div>
          <p className="text-[#9c7349] dark:text-[#cba885] text-sm md:text-base">
            {view === 'overview' 
              ? 'Manage where customers collect their orders.' 
              : 'Enter the details for your secondary pickup point.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        {/* Left Column: Map & Address Card */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {view === 'overview' ? (
            <div className="flex flex-col gap-4">
              {/* Existing Address Card */}
              <div className="bg-white dark:bg-[#2d241b] rounded-2xl border-2 border-[#f48c25] shadow-sm overflow-hidden">
                <div className="p-5 flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="size-10 rounded-lg bg-[#f48c25]/10 flex items-center justify-center text-[#f48c25]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1c140d] dark:text-white">Main Storefront (Default)</h4>
                      <p className="text-sm text-[#9c7349] dark:text-[#cba885]">123 Merchant Way, San Francisco, CA</p>
                    </div>
                  </div>
                  <CheckCircle size={20} className="text-[#f48c25]" />
                </div>
              </div>

              {/* Add New Location Trigger */}
              <button 
                onClick={() => setView('manage')}
                className="flex items-center justify-center gap-3 py-6 border-2 border-dashed border-[#e8dbce] dark:border-[#4a3b2e] rounded-2xl text-[#9c7349] dark:text-[#cba885] font-bold hover:bg-[#f48c25]/5 hover:border-[#f48c25]/40 transition-all group"
              >
                <div className="p-2 rounded-full bg-[#e8dbce]/50 dark:bg-[#4a3b2e]/50 group-hover:bg-[#f48c25] group-hover:text-white transition-colors">
                  <Plus size={20} />
                </div>
                Add Another Location
              </button>
            </div>
          ) : (
            /* NEW LOCATION FORM */
            <div className="bg-white dark:bg-[#2d241b] rounded-2xl border-2 border-[#e8dbce] dark:border-[#4a3b2e] p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg dark:text-white">Location Details</h3>
                <button onClick={() => setView('overview')} className="text-[#9c7349] hover:text-red-500"><X size={20}/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-[#9c7349]">Postcode / ZIP</label>
                  <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="E.g. SW1A 1AA"
                        className="flex-1 p-3 rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] dark:bg-[#1c140d] dark:text-white focus:border-[#f48c25] outline-none"
                        value={addressDetails.postcode}
                        onChange={(e) => setAddressDetails({...addressDetails, postcode: e.target.value})}
                    />
                    <Button variant="outline" className="h-full rounded-xl" onClick={handleFetch}>Fetch</Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-[#9c7349]">Location Nickname</label>
                  <input
                    type="text"
                    placeholder="e.g. West End Branch"
                    className="p-3 rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] dark:bg-[#1c140d] dark:text-white focus:border-[#f48c25] outline-none"
                    value={addressDetails.nickname}
                    onChange={(e) => setAddressDetails({...addressDetails, nickname: e.target.value})}
                  />
                </div>

                {/* Auto-filled Fields */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-[#9c7349]">City</label>
                  <input
                    type="text"
                    placeholder="London"
                    className="p-3 rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] dark:bg-[#1c140d] dark:text-white focus:border-[#f48c25] outline-none"
                    value={addressDetails.city}
                    onChange={(e) => setAddressDetails({...addressDetails, city: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-[#9c7349]">State / County</label>
                  <input
                    type="text"
                    placeholder="Greater London"
                    className="p-3 rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] dark:bg-[#1c140d] dark:text-white focus:border-[#f48c25] outline-none"
                    value={addressDetails.state}
                    onChange={(e) => setAddressDetails({...addressDetails, state: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-[#9c7349]">Country</label>
                  <input
                    type="text"
                    placeholder="United Kingdom"
                    className="p-3 rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] dark:bg-[#1c140d] dark:text-white focus:border-[#f48c25] outline-none"
                    value={addressDetails.country}
                    onChange={(e) => setAddressDetails({...addressDetails, country: e.target.value})}
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase text-[#9c7349]">Street Address</label>
                  <input
                    type="text"
                    placeholder="123 Street Name"
                    className="p-3 rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] dark:bg-[#1c140d] dark:text-white focus:border-[#f48c25] outline-none"
                    value={addressDetails.street}
                    onChange={(e) => setAddressDetails({...addressDetails, street: e.target.value})}
                  />
                </div>
              </div>
              <div className="h-[200px] bg-[#f4ede7] dark:bg-[#1c140d] rounded-xl flex items-center justify-center border border-[#e8dbce] dark:border-[#4a3b2e]">
                 <Navigation size={32} className="text-[#f48c25]/30" />
                 <span className="ml-2 text-xs font-bold text-[#9c7349]">Map Preview Updating...</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Information & Instructions */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Information Card */}
          <div className="bg-[#fcf9f6] dark:bg-[#2d241b] p-6 rounded-2xl border border-[#e8dbce] dark:border-[#4a3b2e]">
            <div className="flex gap-4 mb-4">
              <div className="size-10 rounded-full bg-[#f48c25] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#f48c25]/20">
                <Info size={20} />
              </div>
              <div>
                <p className="font-bold text-[#1c140d] dark:text-white">Business Locations</p>
                <p className="text-xs text-[#9c7349] dark:text-[#cba885] mt-1 leading-relaxed">
                  Adding multiple addresses allows you to serve different regions. 
                  When an order is placed, you can manage inventory specific to each branch.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions Field */}
          <div className="bg-white dark:bg-[#2d241b] p-6 rounded-2xl border-2 border-[#e8dbce] dark:border-[#4a3b2e]">
            <label className="text-sm font-bold text-[#1c140d] dark:text-white mb-3 block">
              Pickup Instructions (Public)
            </label>
            <textarea 
              className="w-full min-h-[120px] rounded-xl border-2 border-[#e8dbce] dark:border-[#4a3b2e] bg-[#fcf9f6] dark:bg-[#1c140d] p-4 text-sm focus:border-[#f48c25] focus:ring-0 dark:text-white transition-all"
              placeholder="e.g. Park in the designated yellow zones..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="relative p-4 bg-white dark:bg-[#2d241b] border-t border-[#e8dbce] dark:border-[#4a3b2e] md:relative md:bg-transparent md:border-none md:p-0 md:mt-12 w-full">
        <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="px-6 py-3.5 rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] text-[#1c140d] dark:text-white font-bold text-sm flex items-center gap-2"
            type="button"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <button
            onClick={handleFinish}
            className="flex-1 md:flex-none px-12 py-3.5 rounded-xl bg-[#f48c25] text-white font-bold text-sm shadow-lg shadow-[#f48c25]/20 flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95"
            type="button"
          >
            {view === 'manage' ? 'Save New Location' : 'Finish Pickup Setup'}
            <CheckCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}