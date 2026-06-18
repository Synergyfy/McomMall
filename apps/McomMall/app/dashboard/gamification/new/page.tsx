'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Gift, HelpCircle, ArrowRight, ArrowLeft, CheckCircle2,
  Lock, Coins, Calendar, MapPin, Sparkles, Check, Download,
  Smartphone, Eye, Layers, Settings, Play, ArrowLeftCircle, X
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/service/api';

type StepType = 1 | 2 | 3 | 4;

interface GameTypeItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
  isNew?: boolean;
}

interface RewardTypeItem {
  id: string;
  title: string;
  icon: string;
  badge: string;
  placeholder: string;
  defaultVal: string;
}

export default function GamificationWizard() {
  const router = useRouter();
  const [step, setStep] = useState<StepType>(1);

  // Form State
  const [title, setTitle] = useState('Neighborhood Summer Blast');
  const [gameType, setGameType] = useState('spin-wheel');
  const [rewardType, setRewardType] = useState('discounts');
  const [rewardValue, setRewardValue] = useState('15% off');
  const [rewardQty, setRewardQty] = useState(100);
  const [isLimitedTime, setIsLimitedTime] = useState(true);

  // Rules State
  const [dailyLimitEnabled, setDailyLimitEnabled] = useState(true);
  const [dailyLimitValue, setDailyLimitValue] = useState(3);
  const [loyaltyOnly, setLoyaltyOnly] = useState(false);
  const [minSpendEnabled, setMinSpendEnabled] = useState(true);
  const [minSpendCurrency, setMinSpendCurrency] = useState('USD ($)');
  const [minSpendValue, setMinSpendValue] = useState(15.00);
  const [qrUnlockEnabled, setQrUnlockEnabled] = useState(true);
  const [boroughRulesEnabled, setBoroughRulesEnabled] = useState(false);
  const [boroughs, setBoroughs] = useState<string[]>(['Brooklyn', 'Manhattan']);

  // Preview Phone State
  const [previewTab, setPreviewTab] = useState<'game' | 'app' | 'reward'>('game');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Types list
  const GAME_TYPES: GameTypeItem[] = [
    {
      id: 'spin-wheel',
      title: 'Spin Wheel',
      description: 'A classic chance-based game where customers spin a digital wheel for instant storefront rewards.',
      icon: <Trophy className="w-6 h-6 text-primary" />,
      popular: true
    },
    {
      id: 'reward-drop',
      title: 'Reward Drop',
      description: 'Scheduled surprise drops. High engagement mechanic for limited-time inventory clearing.',
      icon: <Gift className="w-6 h-6 text-primary" />
    },
    {
      id: 'prize-unlock',
      title: 'Prize Unlock',
      description: 'Tiered rewards unlocked via customer check-ins or purchase milestones at your shop.',
      icon: <Check className="w-6 h-6 text-primary" />
    },
    {
      id: 'point-challenge',
      title: 'Point Challenge',
      description: 'Leaderboard-based competition. Encourage repeat visits to climb the community rankings.',
      icon: <Layers className="w-6 h-6 text-primary" />
    },
    {
      id: 'scratch-card',
      title: 'Scratch Card',
      description: 'Tactile digital experience where users scratch to reveal discounts and special offers.',
      icon: <Sparkles className="w-6 h-6 text-primary" />
    },
    {
      id: 'qr-hunt',
      title: 'QR Hunt',
      description: 'Drive foot traffic by placing physical QR codes around your store for digital discovery.',
      icon: <Smartphone className="w-6 h-6 text-primary" />
    },
    {
      id: 'borough-challenge',
      title: 'Borough Challenge',
      description: 'Collaborate with local shops in your area for a neighborhood-wide scavenger hunt.',
      icon: <MapPin className="w-6 h-6 text-white" />,
      isNew: true
    }
  ];

  const REWARD_TYPES: RewardTypeItem[] = [
    { id: 'discounts', title: 'Discounts', icon: 'percent', badge: 'DISCOUNT', placeholder: 'e.g. 20% off', defaultVal: '20% off' },
    { id: 'products', title: 'Free Products', icon: 'inventory_2', badge: 'PRODUCT', placeholder: 'e.g. Free Latte', defaultVal: 'Free Latte' },
    { id: 'points', title: 'Loyalty Points', icon: 'stars', badge: 'LOYALTY', placeholder: 'e.g. 500 points', defaultVal: '500 points' },
    { id: 'vouchers', title: 'Vouchers', icon: 'confirmation_number', badge: 'VOUCHER', placeholder: 'e.g. $10 Gift Voucher', defaultVal: '$10 Gift Card' },
    { id: 'services', title: 'Free Services', icon: 'handyman', badge: 'SERVICE', placeholder: 'e.g. Free Styling session', defaultVal: 'Free Session' },
    { id: 'events', title: 'Event Access', icon: 'local_activity', badge: 'EVENT', placeholder: 'e.g. VIP Backstage ticket', defaultVal: 'VIP Access' }
  ];

  // Set default reward value on select
  const selectRewardType = (type: string) => {
    setRewardType(type);
    const details = REWARD_TYPES.find(r => r.id === type);
    if (details) {
      setRewardValue(details.defaultVal);
    }
  };

  // Submit Handler
  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        gameType,
        rewardType,
        rewardValue,
        rewardQty,
        isLimitedTime,
        dailyLimitEnabled,
        dailyLimitValue,
        loyaltyOnly,
        minSpendEnabled,
        minSpendCurrency: minSpendCurrency.split(' ')[0], // USD
        minSpendValue,
        qrUnlockEnabled,
        boroughRulesEnabled,
        boroughs: boroughRulesEnabled ? boroughs : [],
        status: 'active'
      };

      await api.post('/gamification', payload);
      toast.success('Successfully published gamification campaign!');
      router.push('/dashboard/gamification');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 md:p-10 space-y-6 max-w-5xl mx-auto pb-24">
      {/* Top Header Controls */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
        <button 
          onClick={() => {
            if (step > 1) setStep((prev) => (prev - 1) as StepType);
            else router.push('/dashboard/gamification');
          }}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-all active:scale-95 duration-200"
        >
          <ArrowLeftCircle size={18} />
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black tracking-widest text-primary bg-[#ffdbcc] px-3 py-1 rounded-full uppercase">
            Step {step} of 4
          </span>
          <button 
            onClick={() => router.push('/dashboard/gamification')}
            className="w-8 h-8 flex items-center justify-center border border-slate-200 hover:bg-slate-100 rounded-full active:scale-95 transition-all text-secondary"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: SELECT GAME TYPE */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold font-title-md">Create New Engagement</h2>
              <p className="text-xs text-gray-500 font-medium">Select a game mechanic to attract customers to your storefront and build loyalty.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {GAME_TYPES.map((game) => (
                <div
                  key={game.id}
                  onClick={() => {
                    setGameType(game.id);
                    setStep(2);
                  }}
                  className={`border rounded-2xl p-6 flex flex-col gap-4 cursor-pointer transition-all hover:shadow-md ${
                    gameType === game.id 
                      ? 'border-primary bg-[#ffdbcc]/10 shadow-sm ring-1 ring-primary/20' 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      gameType === game.id ? 'bg-[#ffdbcc]' : 'bg-slate-100'
                    }`}>
                      {game.icon}
                    </div>
                    {game.popular && (
                      <span className="bg-primary text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Popular</span>
                    )}
                    {game.isNew && (
                      <span className="bg-gradient-to-r from-primary to-orange-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">New</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold font-title-md text-sm text-[#0b1c30] mb-1">{game.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-body-md">{game.description}</p>
                  </div>
                  <div className="mt-auto pt-2 flex items-center text-primary font-bold text-xs">
                    Configure Game <ArrowRight size={12} className="ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: ADD REWARDS */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            <div>
              <h2 className="text-2xl font-bold font-title-md">Campaign Reward Setup</h2>
              <p className="text-xs text-gray-500 font-medium">Configure the incentives for your "{title}" gamification campaign.</p>
            </div>

            {/* Campaign title input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Campaign Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-sm"
              />
            </div>

            <section className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Select Reward Type</label>
              <div className="grid grid-cols-2 gap-4">
                {REWARD_TYPES.map((reward) => (
                  <button
                    key={reward.id}
                    type="button"
                    onClick={() => selectRewardType(reward.id)}
                    className={`border p-4 rounded-xl flex flex-col items-center text-center transition-all ${
                      rewardType === reward.id
                        ? 'border-primary bg-[#ffdbcc] text-[#7b2f00] font-bold shadow-sm'
                        : 'border-slate-200 bg-white text-[#0b1c30] hover:border-primary/40'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      rewardType === reward.id ? 'bg-[#ff6900]/10 text-primary' : 'bg-slate-50 text-slate-500'
                    }`}>
                      <span className="material-symbols-outlined">{reward.icon}</span>
                    </div>
                    <span className="font-bold text-xs">{reward.title}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Config panel */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-6">
              <h3 className="text-sm font-bold font-title-md border-b pb-3 text-primary uppercase tracking-wider">Configure Reward Value</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Reward Value / Magnitude</label>
                <input
                  type="text"
                  value={rewardValue}
                  onChange={(e) => setRewardValue(e.target.value)}
                  placeholder={REWARD_TYPES.find(r => r.id === rewardType)?.placeholder}
                  className="w-full bg-[#f8f9ff] border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-sm font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Quantity Available</label>
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setRewardQty(prev => Math.max(10, prev - 10))}
                    className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center active:scale-90 transition-transform font-bold text-lg"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={rewardQty}
                    onChange={(e) => setRewardQty(Math.max(1, parseInt(e.target.value) || 0))}
                    className="flex-1 text-center bg-[#f8f9ff] border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-lg"
                  />
                  <button 
                    type="button"
                    onClick={() => setRewardQty(prev => prev + 10)}
                    className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center active:scale-90 transition-transform font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Expire toggle */}
              <div className="bg-[#f8f9ff] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">timer</span>
                  <div>
                    <p className="text-xs font-bold font-title-md">Limited Time Offer</p>
                    <p className="text-[10px] text-gray-400">Set expiration for this reward</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLimitedTime}
                    onChange={(e) => setIsLimitedTime(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            {/* Customer preview container */}
            <div className="border-t border-slate-200/60 pt-6">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-4">Customer Preview</label>
              <div className="relative rounded-3xl overflow-hidden aspect-[16/9] bg-[#213145] shadow-md">
                <img 
                  className="w-full h-full object-cover opacity-60" 
                  alt="Customer Preview Banner"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCijsY3qI3Cgcy9lmUbLlI6KNZJG7-UYeSPvuOBs5Izn3SKbxqt1VEuf0Kkxh4C1ilk4cL3j8EmMIutq91EsUTBahffyvIjQ5-IPHkb-Mzb4Pk626Y_1Jsi4bVIeOPA42C7QLHBo2OycCofFKH7G91Nw3oBwhX6kf-pQ-KI1rz0eWxPMCWQCik1v5ZdbJAp4SVjB9HN762oZLIVEE18IPzAmoFd2r_bbxrblDhJY31r28qs8RWSRyE7kXBvmdTLNxdSv2ehVXYt0lY"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent p-6 flex flex-col justify-end">
                  <div className="bg-[#ff6900] w-fit px-3 py-1 rounded-lg mb-2">
                    <span className="text-[10px] text-white font-extrabold tracking-wide uppercase">
                      {REWARD_TYPES.find(r => r.id === rewardType)?.badge}
                    </span>
                  </div>
                  <h4 className="text-3xl font-extrabold text-white leading-none mb-1">
                    {rewardValue}
                  </h4>
                  <p className="text-white/80 text-xs font-medium font-body-md">Unlocked via {title}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-primary text-white font-bold text-xs py-4 rounded-xl shadow-lg hover:bg-primary/95 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Continue to Rules Setup
              <ArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* Step 3: GAME RULES SETTINGS */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            <div>
              <h2 className="text-2xl font-bold font-title-md">Game Rule Settings</h2>
              <p className="text-xs text-gray-500 font-medium">Configure participation rules and engagement limits for your storefront's interactive gamification features.</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(4); }}>
              {/* Daily limit limit card */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">history</span>
                    <label className="font-bold text-sm font-title-md">Daily Play Limit</label>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dailyLimitEnabled}
                      onChange={(e) => setDailyLimitEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                {dailyLimitEnabled && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-xs text-gray-500 leading-normal">Maximum number of game attempts a unique customer can make per 24-hour cycle.</p>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={dailyLimitValue}
                        onChange={(e) => setDailyLimitValue(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 bg-[#f8f9ff] border border-slate-200 rounded-lg px-3 py-2 text-primary font-bold text-center outline-none"
                      />
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Attempts / user</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Loyalty Access */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                    <label className="font-bold text-sm font-title-md">Loyalty Only Access</label>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loyaltyOnly}
                      onChange={(e) => setLoyaltyOnly(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-slate-500 text-base mt-0.5">info</span>
                  <p className="text-[10px] text-gray-400 leading-relaxed">If enabled, only members of your VIP or Loyalty tiers can participate in this campaign.</p>
                </div>
              </div>

              {/* Min spend spend requirement */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">payments</span>
                    <label className="font-bold text-sm font-title-md">Minimum Spend Requirement</label>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={minSpendEnabled}
                      onChange={(e) => setMinSpendEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                {minSpendEnabled && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Currency</label>
                      <select 
                        value={minSpendCurrency} 
                        onChange={(e) => setMinSpendCurrency(e.target.value)}
                        className="w-full bg-[#f8f9ff] border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                      >
                        <option>USD ($)</option>
                        <option>GBP (£)</option>
                        <option>EUR (€)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Threshold</label>
                      <input
                        type="number"
                        value={minSpendValue}
                        onChange={(e) => setMinSpendValue(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-[#f8f9ff] border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* QR Scan Unlock */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">qr_code_2</span>
                    <label className="font-bold text-sm font-title-md">QR Unlock Mechanism</label>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qrUnlockEnabled}
                      onChange={(e) => setQrUnlockEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                {qrUnlockEnabled && (
                  <div className="flex gap-4 items-center pt-2 border-t border-slate-100">
                    <div className="w-20 h-20 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-4xl text-slate-400">qr_code_2</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 leading-normal">Customers must scan a physical QR code at your POS terminal or menu table to play.</p>
                      <button 
                        type="button"
                        onClick={() => toast.success('QR design downloaded as PDF!')}
                        className="text-primary font-bold text-[10px] flex items-center gap-1 hover:underline active:scale-95 transition-all"
                      >
                        <Download size={12} />
                        Download Print PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Borough Zones */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                    <label className="font-bold text-sm font-title-md">Borough Participation Rules</label>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boroughRulesEnabled}
                      onChange={(e) => setBoroughRulesEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                {boroughRulesEnabled && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <p className="text-xs text-gray-500 leading-normal">Limit this game's visibility to specific neighborhood zones.</p>
                    <div className="flex flex-wrap gap-2">
                      {boroughs.map(borough => (
                        <span key={borough} className="inline-flex items-center gap-1 bg-orange-50 text-primary px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                          {borough}
                          <button 
                            type="button"
                            onClick={() => setBoroughs(prev => prev.filter(b => b !== borough))}
                            className="text-primary hover:text-red-600 transition-colors"
                          >
                            <X size={12} className="stroke-[3]" />
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const name = prompt('Enter Borough Target name:');
                          if (name) setBoroughs(prev => [...prev, name]);
                        }}
                        className="inline-flex items-center gap-1 border border-slate-200 text-slate-500 px-3 py-1 rounded-full text-xs hover:bg-slate-50 transition-colors"
                      >
                        + Add Borough
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white font-bold text-xs py-4 rounded-xl shadow-lg hover:bg-primary/95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Go to Campaign Preview
                <ArrowRight size={14} />
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 4: LIVE PREVIEW & ACTIVATE */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
          >
            {/* Control Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-primary font-extrabold tracking-wider uppercase text-[10px]">Merchant Sandbox</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-[#0b1c30]">Live Campaign Preview</h2>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">Verify your interactive settings in real-time. See exactly what your customers experience inside the shopper mobile app.</p>
              </div>

              {/* Toggle sandbox views */}
              <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 w-full sm:w-fit border">
                {(['game', 'app', 'reward'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPreviewTab(tab)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                      previewTab === tab 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-gray-500 hover:text-primary hover:bg-slate-200/50'
                    }`}
                  >
                    {tab === 'game' && 'Game UI'}
                    {tab === 'app' && 'App Shell'}
                    {tab === 'reward' && 'Reward View'}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold font-title-md border-b pb-2 flex items-center gap-2">
                  <Settings size={16} className="text-primary" /> Setup Summary
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase">Name</span>
                    <span className="font-extrabold text-[#0b1c30]">{title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase">Game type</span>
                    <span className="font-extrabold text-primary uppercase">{gameType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase">Reward</span>
                    <span className="font-extrabold text-[#0b1c30]">{rewardValue} ({rewardQty} qty)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase">Min spend</span>
                    <span className="font-extrabold text-slate-700">
                      {minSpendEnabled ? `${minSpendCurrency.split(' ')[0]} ${minSpendValue.toFixed(2)}` : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-sm hover:scale-[1.01] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Saving Campaign...' : 'Publish Updates'}
              </button>
            </div>

            {/* Mobile frame preview column */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-[340px] h-[660px] rounded-[48px] bg-slate-950 p-2.5 border-4 border-slate-800 shadow-2xl relative flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-white rounded-[38px] overflow-hidden relative flex flex-col justify-between">
                  {/* Status Bar */}
                  <div className="h-10 w-full flex items-center justify-between px-6 pt-4 pb-2 z-50 absolute top-0 left-0 bg-transparent text-slate-800">
                    <span className="text-[10px] font-black">9:41 AM</span>
                    <div className="flex gap-1.5 text-xs text-slate-800 font-bold">
                      <span>LTE</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Sandbox rendering content */}
                  <div className="w-full h-full relative pt-10 flex flex-col justify-between bg-[#f8f9ff]">
                    {/* View 1: Game UI view */}
                    {previewTab === 'game' && (
                      <div className="flex-1 flex flex-col relative justify-between">
                        <div className="relative h-[48%] overflow-hidden w-full shrink-0">
                          <img 
                            className="w-full h-full object-cover" 
                            alt="Mock Game Graphic"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeeqt3N4IBtsWfhQdcO0qfshVDCPu-8uKRuDFH_FLJGQyQmnxJSPNqD6SMcuAg4yXV0WQy8L7RDw5fDuzHkubJbEnyaCBhxJkS-SYPQ4AfRwG_lTCN9XaioljWBSBohI5bfjxGYnk3dm_PP4QmsZ97cuZXpeSrDozUkT4sRAjLOUG63xCk-7jDqJh3W1wcDe84wx3kd1qmsCaPRwpIY970Pl6IjuzFCnQpau0F7mKsW6ruXB7eOKrQMQUL52XOX0EvvNbwiTFNNjM"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60" />
                          <div className="absolute top-6 left-6 bg-white/95 px-3 py-1 rounded-full flex items-center gap-1.5 text-[9px] font-extrabold border shadow-sm">
                            <Trophy size={11} className="text-primary fill-primary" />
                            <span>1,450 XP</span>
                          </div>
                        </div>

                        {/* Spinner wheel metadata */}
                        <div className="flex-1 bg-white p-5 rounded-t-[32px] -mt-8 relative shadow-2xl flex flex-col justify-between">
                          <div className="space-y-3.5">
                            <h4 className="text-base font-extrabold text-[#0b1c30]">Mystery Spin & Win</h4>
                            <p className="text-[10px] text-gray-500 leading-relaxed font-body-md">Spin the wheel and unlock exclusive store discounts, limited edition digital products, or bonus loyalty points!</p>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 border rounded-xl text-center">
                                <p className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">Attempts</p>
                                <p className="text-base font-extrabold text-primary">{dailyLimitEnabled ? dailyLimitValue : 'No limit'}</p>
                              </div>
                              <div className="p-3 border rounded-xl text-center">
                                <p className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">Best Reward</p>
                                <p className="text-base font-extrabold text-[#ff6900] truncate">{rewardValue}</p>
                              </div>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setPreviewTab('reward')}
                            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all"
                          >
                            Spin Now
                          </button>
                        </div>
                      </div>
                    )}

                    {/* View 2: App Shell View */}
                    {previewTab === 'app' && (
                      <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">J</div>
                            <div>
                              <p className="text-[8px] font-bold text-gray-400 uppercase">Welcome back</p>
                              <p className="text-xs font-extrabold text-slate-800">Jane Cooper</p>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-slate-400 text-lg">notifications</span>
                        </div>

                        {/* Progress */}
                        <div className="bg-[#a14000] rounded-2xl p-5 text-white relative overflow-hidden shadow-sm">
                          <div className="relative z-10 space-y-3">
                            <h5 className="text-sm font-bold">Loyalty Level 12</h5>
                            <p className="text-[10px] text-white/85 leading-normal">You are only 45 points away from your next reward!</p>
                            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white rounded-full" style={{ width: '80%' }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Recent play log */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-extrabold text-slate-800">Recent Activity</span>
                            <span className="text-primary font-bold text-[10px]">See all</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-sm">shopping_cart</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800">Store purchase</p>
                                <p className="text-[9px] text-gray-400">Earned +150 Points</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-sm">videogame_asset</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800">Played Spin & Win</p>
                                <p className="text-[9px] text-gray-400">Redeemed 20 XP</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* View 3: Reward win view */}
                    {previewTab === 'reward' && (
                      <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-orange-50 border-2 border-primary flex items-center justify-center text-primary mb-6 animate-pulse">
                          <Gift size={32} />
                        </div>
                        <h4 className="text-lg font-extrabold text-[#0b1c30] mb-2 font-title-md">You Won!</h4>
                        <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed mb-6 font-body-md">Congratulations! You've unlocked an exclusive storefront reward.</p>

                        <div className="w-full bg-white border-2 border-dashed border-primary rounded-2xl p-6 shadow-sm">
                          <p className="text-[8px] text-gray-400 uppercase font-bold tracking-wider mb-1">Coupon Reward Value</p>
                          <p className="text-2xl font-extrabold text-primary tracking-tight mb-3">{rewardValue.toUpperCase()}</p>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">MEGASTORE25</span>
                        </div>

                        <p className="text-[9px] text-gray-400 mt-6 leading-relaxed">Valid for 48 hours. Scan at checkout terminal to claim.</p>
                        <button
                          type="button"
                          onClick={() => setPreviewTab('game')}
                          className="mt-8 w-full py-3 bg-[#0b1c30] text-white rounded-xl font-bold text-xs"
                        >
                          Return to Game
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Home Indicator */}
                  <div className="h-6 w-full flex justify-center items-center bg-white border-t border-slate-100">
                    <div className="w-24 h-1 bg-slate-200 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
