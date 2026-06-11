'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Star,
  CheckCircle,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';

export default function CreateRewardRulePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [ruleName, setRuleName] = useState('');
  const [pointsValue, setPointsValue] = useState('100');
  const [triggerAction, setTriggerAction] = useState('Visit');
  
  // Step 2 states
  const [targetSegment, setTargetSegment] = useState('All Members');
  const [limitCount, setLimitCount] = useState('Once per day');
  const [minPurchase, setMinPurchase] = useState('');

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/dashboard/loyalty');
    }
  };

  const handlePublish = () => {
    setIsSuccess(true);
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
          <button 
            onClick={handleBackStep}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* ── HEADER ── */}
        <section>
          <h2 className="font-bold text-2xl text-gray-900 leading-tight">Create Reward Rule</h2>
          <p className="text-xs text-gray-500 mt-1">
            Configure rules that issue points to customers automatically.
          </p>
        </section>

        {/* ── PROGRESS STEPPER ── */}
        <div className="flex items-center justify-between px-4 py-2 bg-white rounded-2xl border border-[#f7ece7] shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              currentStep >= 1 ? 'bg-[#a14000] text-white' : 'bg-[#f7ece7] text-gray-400'
            }`}>
              1
            </div>
            <span className={`text-[9px] font-black tracking-wider uppercase ${
              currentStep >= 1 ? 'text-[#a14000]' : 'text-gray-400'
            }`}>
              Details
            </span>
          </div>

          <div className={`h-[2px] flex-1 mx-2 transition-colors duration-300 ${
            currentStep >= 2 ? 'bg-[#a14000]' : 'bg-[#f7ece7]'
          }`} />

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${
              currentStep >= 2 ? 'bg-[#a14000] text-white' : 'bg-[#f7ece7] text-gray-400'
            }`}>
              2
            </div>
            <span className={`text-[9px] font-black tracking-wider uppercase transition-colors duration-300 ${
              currentStep >= 2 ? 'text-[#a14000]' : 'text-gray-400'
            }`}>
              Settings
            </span>
          </div>

          <div className={`h-[2px] flex-1 mx-2 transition-colors duration-300 ${
            currentStep >= 3 ? 'bg-[#a14000]' : 'bg-[#f7ece7]'
          }`} />

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${
              currentStep >= 3 ? 'bg-[#a14000] text-white' : 'bg-[#f7ece7] text-gray-400'
            }`}>
              3
            </div>
            <span className={`text-[9px] font-black tracking-wider uppercase transition-colors duration-300 ${
              currentStep >= 3 ? 'text-[#a14000]' : 'text-gray-400'
            }`}>
              Preview
            </span>
          </div>
        </div>

        {/* ── STEP CONTENT PANELS ── */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              <div className="bg-white p-5 rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-4">
                <h3 className="font-bold text-sm text-gray-950">Define Your Rule</h3>
                
                {/* Rule Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Rule Name</label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g., Summer Weekend Boost"
                    className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-medium placeholder:text-gray-400"
                  />
                </div>

                {/* Points Value & Trigger Action */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Points Value</label>
                    <div className="relative">
                      <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 shrink-0" />
                      <input
                        type="number"
                        value={pointsValue}
                        onChange={(e) => setPointsValue(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Trigger Action</label>
                    <select
                      value={triggerAction}
                      onChange={(e) => setTriggerAction(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-bold appearance-none"
                    >
                      <option>Visit</option>
                      <option>Purchase</option>
                      <option>Share Profile</option>
                      <option>Write Review</option>
                      <option>Friend Referral</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Visual Inspiration Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#f7ece7]">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Visual Inspiration</h4>
                </div>
                <div className="relative h-44">
                  <img
                    alt="In-store Engagement"
                    src="/loyalty_rule_inspiration.png"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                    <p className="text-[10px] font-black uppercase text-orange-200 tracking-widest">Store Context</p>
                    <h4 className="font-bold text-base mt-1">In-Store Engagement</h4>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                disabled={!ruleName.trim()}
                className={`w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-1.5 transition-all ${
                  ruleName.trim() 
                    ? 'bg-[#a14000] hover:opacity-90 active:scale-95 cursor-pointer shadow-orange-600/10' 
                    : 'bg-gray-300 shadow-none cursor-not-allowed'
                }`}
              >
                Next: Settings
              </button>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              <div className="bg-white p-5 rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-4">
                <h3 className="font-bold text-sm text-gray-950">Settings & Constraints</h3>

                {/* Target Segment */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Target Segment</label>
                  <select
                    value={targetSegment}
                    onChange={(e) => setTargetSegment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-bold appearance-none"
                  >
                    <option>All Members</option>
                    <option>VIP Exclusive Only</option>
                    <option>Gold Tier & Above</option>
                    <option>Silver Standard Only</option>
                    <option>Inactive Members Only</option>
                  </select>
                </div>

                {/* Limit Count */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Frequency Limit</label>
                  <select
                    value={limitCount}
                    onChange={(e) => setLimitCount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-bold appearance-none"
                  >
                    <option>Once per day</option>
                    <option>Once per week</option>
                    <option>Once per month</option>
                    <option>Unlimited triggers</option>
                  </select>
                </div>

                {/* Minimum Purchase Amount (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Min. Purchase Amount (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xs text-gray-400">$</span>
                    <input
                      type="number"
                      placeholder="e.g., 20.00"
                      value={minPurchase}
                      onChange={(e) => setMinPurchase(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-[#fff8f5] border border-[#e2bfb0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBackStep}
                  className="flex-1 py-3 bg-white border border-[#e2bfb0] text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-3 bg-[#a14000] text-white rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-lg"
                >
                  Next: Preview
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              <div className="bg-white p-5 rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-4">
                <h3 className="font-bold text-sm text-gray-950">Review Rule Details</h3>

                <div className="p-4 bg-[#fff8f5] rounded-xl border border-[#f7ece7] space-y-3">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Rule Name</span>
                    <span className="text-xs font-bold text-gray-800">{ruleName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Points Issued</span>
                    <span className="text-xs font-black text-[#ea580c] flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-[#ea580c]" /> {pointsValue}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Trigger Action</span>
                    <span className="text-xs font-bold text-gray-800">{triggerAction}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Target Audience</span>
                    <span className="text-xs font-bold text-gray-800">{targetSegment}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Limits</span>
                    <span className="text-xs font-bold text-gray-800">{limitCount}</span>
                  </div>
                  {minPurchase && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Min Spend</span>
                      <span className="text-xs font-bold text-gray-800">${minPurchase}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 text-[10px] text-gray-400 leading-relaxed p-1">
                  <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>Once published, this rule will apply to all matching customer transactions immediately. You can pause it anytime.</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBackStep}
                  className="flex-1 py-3 bg-white border border-[#e2bfb0] text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handlePublish}
                  className="flex-1 py-3 bg-[#a14000] text-white rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-lg"
                >
                  Publish Rule
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                <h3 className="font-bold text-lg text-gray-900 leading-tight">Reward Rule Created!</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Your new rule **{ruleName || 'Summer Weekend Boost'}** has been published successfully and is now monitoring actions.
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
