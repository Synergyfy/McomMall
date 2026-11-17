'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Smartphone,
  Eye,
  QrCode,
  Layers,
  Check,
  Gift,
  Ticket,
  Rocket,
  Info,
  ArrowLeftCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

import { useAddVoucherProduct } from '@/service/hooks/useVoucherService';

type StepType = 1 | 2;

export default function VoucherCreatorWizard() {
  const router = useRouter();
  const addVoucherProduct = useAddVoucherProduct();
  const [step, setStep] = useState<StepType>(1);

  // --- WIZARD FORM STATE ---
  const [voucherType] = useState('gift_voucher');
  const [name, setName] = useState('');
  const [value, setValue] = useState(15);
  const [valueType, setValueType] = useState('percentage'); // 'percentage' | 'currency'
  const [expiryDate, setExpiryDate] = useState('');
  const [rules, setRules] = useState('');
  const [distributionChannels] = useState<string[]>(['storefront', 'email', 'qr']);
  
  // Preview view toggle (mobile vs poster)
  const [previewView, setPreviewView] = useState<'mobile' | 'poster'>('mobile');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Earliest selectable expiry date (today, in local time)
  const todayISO = useMemo(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  }, []);

  const expiryInputRef = useRef<HTMLInputElement>(null);

  // Open the native date picker when clicking anywhere in the field,
  // not only on the calendar icon.
  const handleExpiryClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (typeof (input as any).showPicker === 'function') {
      try {
        (input as any).showPicker();
      } catch {
        // Picker may already be open or unsupported in this browser.
      }
    }
  };

  // --- LAYOUT DATA ---

  // Helper validation for steps
  const isExpiryValid = !expiryDate || expiryDate >= todayISO;

  const isStepValid = (currentStep: number) => {
    if (currentStep === 1) {
      return name.trim().length > 0 && value > 0 && isExpiryValid;
    }
    return true;
  };

  const handleNext = () => {
    if (isStepValid(step)) {
      setStep((prev) => (prev + 1) as StepType);
      return;
    }

    if (!isExpiryValid) {
      toast.error('Expiry date cannot be in the past.');
    } else {
      toast.error('Please enter a voucher title and value.');
    }
  };

  const handleBack = () => {
    setStep((prev) => (prev - 1) as StepType);
  };

  // Launch Payload handler
  const handleLaunch = async () => {
    if (!isExpiryValid) {
      toast.error('Expiry date cannot be in the past.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description: `Voucher value: ${valueType === 'percentage' ? `${value}%` : `$${value}`}. ${rules}`,
        voucherType,
        valueType,
        value: Number(value),
        rules,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        distributionChannels,
        status: 'active',
        isEnabled: true
      };

      await addVoucherProduct(payload);
      toast.success('Successfully launched campaign!');
      router.push('/dashboard/vouchers');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to publish voucher product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 md:p-10 space-y-6 max-w-5xl mx-auto pb-24">
      
      {/* Header Wizard Controls */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
        <button
          onClick={() => {
            if (step > 1) handleBack();
            else router.push('/dashboard/vouchers');
          }}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-all active:scale-95"
        >
          <ArrowLeftCircle size={18} />
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black tracking-widest text-primary bg-[#ffdbcc] px-3 py-1 rounded-full uppercase">
            Step {step} of 2
          </span>
          <button 
            onClick={() => router.push('/dashboard/vouchers')}
            className="w-8 h-8 flex items-center justify-center border border-slate-200 hover:bg-slate-100 rounded-full active:scale-95 transition-all text-secondary"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* STEP INDICATOR BAR */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out" 
          style={{ width: `${(step / 2) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: VOUCHER DETAILS FORM */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold font-title-md">Voucher Details</h2>
              <p className="text-xs text-gray-500 font-medium">Configure rules, value offsets, and date configurations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Input panel */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#5a4136] uppercase tracking-wider mb-2">Voucher Title</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Summer Neighborhood Welcome"
                    className="w-full bg-[#f8f9ff] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <p className="mt-1.5 text-[10px] text-gray-400 italic">Keep it short and descriptive.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#5a4136] uppercase tracking-wider mb-2">Value</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        className="w-full bg-[#f8f9ff] border border-slate-200 rounded-xl pl-4 pr-16 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                      <div className="absolute right-2 top-2 bottom-2 bg-slate-100 rounded-lg border border-slate-200 px-3 flex items-center justify-center">
                        <select
                          value={valueType}
                          onChange={(e) => setValueType(e.target.value)}
                          className="bg-transparent border-none text-xs font-bold text-[#0b1c30] focus:ring-0 p-0"
                        >
                          <option value="percentage">%</option>
                          <option value="currency">$</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5a4136] uppercase tracking-wider mb-2">Expiry Date</label>
                    <div className="relative">
                      <input
                        ref={expiryInputRef}
                        type="date"
                        value={expiryDate}
                        min={todayISO}
                        onClick={handleExpiryClick}
                        onChange={(e) => {
                          const nextDate = e.target.value;
                          if (nextDate && nextDate < todayISO) {
                            toast.error('Expiry date cannot be in the past.');
                            setExpiryDate(todayISO);
                            return;
                          }
                          setExpiryDate(nextDate);
                        }}
                        className="w-full bg-[#f8f9ff] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5a4136] uppercase tracking-wider mb-2">Redemption Rules</label>
                  <textarea
                    rows={4}
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    placeholder="List eligibility rules (e.g. valid only on order totals above $40.00)"
                    className="w-full bg-[#f8f9ff] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-4 justify-between flex-wrap">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/vouchers')}
                    className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-full font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStepValid(1)}
                    className="px-8 py-3.5 bg-primary text-white rounded-full font-bold text-xs flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-55"
                  >
                    Continue to Preview
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Live Preview Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 sticky top-24">
                  <h3 className="font-bold text-xs text-[#5a4136] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Eye size={14} className="text-primary" />
                    Live Preview
                  </h3>
                  
                  {/* Preview Card */}
                  <div className="relative bg-white border-2 border-dashed border-primary-container/30 rounded-2xl p-6 overflow-hidden shadow-sm">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-full border-r border-slate-200" />
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-full border-l border-slate-200" />
                    
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-[#ffdbcc] mx-auto rounded-full flex items-center justify-center mb-4 text-primary">
                        <Ticket size={24} />
                      </div>
                      <span className="font-bold text-sm text-[#0b1c30] block">{name || 'New Voucher'}</span>
                      <div className="flex items-center justify-center gap-1 text-primary mt-1">
                        <span className="text-2xl font-black">{valueType === 'currency' ? `$${value}` : `${value}`}</span>
                        <span className="text-xs font-bold">{valueType === 'percentage' ? '% OFF' : ' OFF'}</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-slate-200 pt-6 flex flex-col items-center">
                      <div className="bg-[#f8f9ff] px-4 py-2 rounded-lg border border-slate-100 font-mono tracking-widest text-[#5a4136] font-bold text-xs mb-3">
                        KIN24-PREVIEW
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Expires: {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'Set Date'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Check size={14} className="text-green-600 bg-green-50 p-0.5 rounded-full mt-0.5" />
                      <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">Validated for neighborhood mobile wallets</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check size={14} className="text-green-600 bg-green-50 p-0.5 rounded-full mt-0.5" />
                      <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">Estimated 1.2k local reach</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: PREVIEW & ACTIVATE */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold font-title-md">Launch Campaign</h2>
              <p className="text-xs text-gray-500 font-medium">Verify your storefront campaign layout across screen dimensions before going live.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Controls (Left) */}
              <div className="md:col-span-5 space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* View Toggles */}
                  <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/50">
                    <button
                      onClick={() => setPreviewView('mobile')}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        previewView === 'mobile' 
                          ? 'bg-primary-container text-white shadow-sm' 
                          : 'text-[#5a4136] hover:bg-slate-200/40'
                      }`}
                    >
                      <Smartphone size={14} />
                      Mobile Wallet
                    </button>
                    <button
                      onClick={() => setPreviewView('poster')}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        previewView === 'poster' 
                          ? 'bg-primary-container text-white shadow-sm' 
                          : 'text-[#5a4136] hover:bg-slate-200/40'
                      }`}
                    >
                      <Layers size={14} />
                      Storefront Poster
                    </button>
                  </div>

                  {/* Summary info cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Voucher Value</span>
                      <span className="text-xl font-black text-primary font-stat-lg">
                        {valueType === 'currency' ? `$${value}.00` : `${value}% OFF`}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Expiry Rule</span>
                      <span className="text-sm font-black text-slate-800">
                        {expiryDate ? new Date(expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Perpetual'}
                      </span>
                    </div>
                  </div>

                  {/* Alert check details */}
                  <div className="bg-[#ffdbcc]/40 border border-[#e2bfb0]/40 p-5 rounded-2xl flex gap-3 text-[#7b2f00]">
                    <Info size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs mb-1">Safety Instruction</h4>
                      <p className="text-[10px] text-[#7b2f00]/80 leading-relaxed font-medium">
                        Once live, details and voucher value types cannot be modified in order to preserve trust across claimed wallets.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLaunch}
                  disabled={isSubmitting}
                  className="w-full bg-primary-container text-white py-4 rounded-2xl font-bold text-sm shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-55"
                >
                  <Rocket size={16} />
                  {isSubmitting ? 'Launching Live...' : 'Launch Voucher Campaign'}
                </button>
              </div>

              {/* Previews Canvas (Right) */}
              <div className="md:col-span-7 flex justify-center">
                {previewView === 'mobile' ? (
                  /* Mobile smartphone simulator Mockup */
                  <div className="relative w-full max-w-[290px] aspect-[9/18] bg-[#0b1c30] rounded-[2.5rem] p-2.5 border-[6px] border-[#0b1c30] shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#0b1c30] rounded-b-xl z-20" />
                    <div className="w-full h-full bg-[#f8f9ff] rounded-[2.1rem] overflow-hidden flex flex-col relative">
                      {/* status bar */}
                      <div className="flex justify-between px-6 pt-3 pb-1 text-[8px] font-bold text-gray-400">
                        <span>9:41</span>
                        <div className="flex gap-1">
                          <Smartphone size={8} />
                          <Smartphone size={8} />
                        </div>
                      </div>
                      
                      {/* mobile scroll contents */}
                      <div className="flex-1 overflow-y-auto px-4 pt-3 space-y-4">
                        <div className="flex items-center gap-1">
                          <ArrowLeft size={10} className="text-primary" />
                          <span className="text-[10px] font-bold">My Rewards</span>
                        </div>

                        {/* Floating Mobile Card */}
                        <div className="bg-white border border-[#e2bfb0]/20 p-5 rounded-2xl shadow-md relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary to-transparent" />
                          <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Exclusive Offer</span>
                                <h4 className="font-extrabold text-[#0b1c30] text-xs">Storefront Welcome</h4>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-[#ffdbcc] flex items-center justify-center text-primary">
                                <Gift size={16} />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-3xl font-black text-slate-800 leading-none">
                                {valueType === 'currency' ? `$${value}` : `${value}%`}
                              </h3>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Store Voucher</span>
                            </div>
                            <div className="border-t border-dashed border-slate-100 pt-3 flex justify-between items-end text-[8px] text-slate-400 font-bold uppercase">
                              <div>
                                <span className="block text-[6px]">Expires</span>
                                <span className="text-[#0b1c30]">{expiryDate ? new Date(expiryDate).toLocaleDateString() : 'Dec 31, 2024'}</span>
                              </div>
                              <div className="text-right">
                                <span className="block text-[6px]">Voucher Code</span>
                                <span className="text-[#0b1c30] tracking-wider">KIN24-WELCOME</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* QR Area */}
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center flex flex-col items-center gap-2">
                          <div className="w-24 h-24 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                            <QrCode size={48} />
                          </div>
                          <span className="text-[10px] font-bold text-[#0b1c30] block">Scan at Counter</span>
                          <span className="text-[8px] text-gray-400 font-medium">Scan to redeem balance</span>
                        </div>
                      </div>
                      <div className="w-20 h-1 bg-slate-200 rounded-full mx-auto mb-2 shrink-0" />
                    </div>
                  </div>
                ) : (
                  /* Poster Print view mockup */
                  <div className="relative w-full max-w-[340px] aspect-[1/1.41] bg-white rounded-xl shadow-2xl overflow-hidden border-8 border-white ring-1 ring-slate-200">
                    <div className="h-2/5 bg-slate-100 relative flex items-center justify-center text-slate-300">
                      {/* background decorative icon placeholder */}
                      <Sparkles size={80} className="text-slate-200" />
                      <div className="absolute top-4 left-4 bg-primary text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
                        Save {valueType === 'currency' ? `$${value}` : `${value}%`}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col items-center text-center justify-between h-3/5">
                      <div>
                        <h4 className="text-xl font-black text-primary font-display-lg">Kinship Storefront</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{name || 'Welcome Campaign'}</p>
                      </div>
                      
                      <div className="flex gap-4 items-center w-full my-4">
                        <div className="flex-1 text-left">
                          <span className="text-[10px] font-bold text-[#0b1c30] uppercase block mb-1">Scan to Claim</span>
                          <p className="text-[9px] text-[#5f5e5e] leading-relaxed">{rules || 'Scan QR code to save voucher directly to your mobile wallet.'}</p>
                        </div>
                        <div className="w-16 h-16 border-2 border-primary rounded-xl shrink-0 p-1 flex items-center justify-center text-primary">
                          <QrCode size={40} />
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3 w-full flex justify-between text-[8px] text-gray-400 font-bold uppercase">
                        <span>Terms & conditions apply</span>
                        <span>kinship.com</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
