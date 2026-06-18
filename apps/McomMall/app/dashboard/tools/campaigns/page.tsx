'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Megaphone,
  PlusCircle,
  TrendingUp,
  Percent,
  Sparkles,
  ChevronRight,
  Eye,
  CheckCircle2,
  Trash2,
  Clock,
  Compass,
  Gift,
  X,
  Volume2,
  Layers,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface CampaignItem {
  id: string;
  title: string;
  type: string;
  status: 'running' | 'scheduled' | 'completed';
  reached: string;
  ctr: string;
  conversion: string;
  icon: string;
}

interface PresetTemplate {
  id: string;
  title: string;
  category: 'seasonal' | 'weekend' | 'flash' | 'retention';
  description: string;
  tag?: string;
  image: string;
  successRate: string;
  type: string;
}

export default function CampaignManagerDashboard() {
  const router = useRouter();

  // Active campaigns list
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([
    {
      id: '1',
      title: 'Anniversary Flash Sale',
      type: 'Flash',
      status: 'running',
      reached: '12.4k',
      ctr: '4.8%',
      conversion: '18.4%',
      icon: '⚡',
    },
    {
      id: '2',
      title: 'Weekend Groceries VIP',
      type: 'Weekend',
      status: 'scheduled',
      reached: '4.2k',
      ctr: '0.0%',
      conversion: '0.0%',
      icon: '🎫',
    },
  ]);

  // Tab filtering for templates
  const [activeTab, setActiveTab] = useState<'seasonal' | 'weekend' | 'flash' | 'retention'>('seasonal');

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard form inputs
  const [campaignType, setCampaignType] = useState('Weekend');
  const [selectedPresetId, setSelectedPresetId] = useState('vip-cuts');
  const [customTitle, setCustomTitle] = useState('Weekend VIP Cuts');
  const [customDesc, setCustomDesc] = useState('Exclusive loyalty points multiplier for prime grocery sections this weekend.');
  const [offerValue, setOfferValue] = useState('Buy 1 Get 1 Free');
  const [duration, setDuration] = useState('3 Days');
  const [distribution, setDistribution] = useState<string[]>(['storefront', 'push']);

  // Presets library
  const presets: PresetTemplate[] = [
    {
      id: 'vip-cuts',
      title: 'Weekend VIP Cuts',
      category: 'weekend',
      description: 'Exclusive loyalty points multiplier for prime grocery sections this weekend.',
      tag: 'Best Seller',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZjbghb1NTuzLYGMB2eQlDgFQI3NJXtdttY45-EDiExViHf4XGLESxVoWiM1KerZisCnIQA79WFAsKmDSTqLYFaiuCrAOwNQn_RTWy3Uh_9gbJZDf75WsWT1oysQlw2wu1g1mzNjfw0fddNArl10KgK6wEmvt4xPeKtooa_Rer4HzRkJAWb7Li8e6nGgDLOidZtZPa-9XGZWztIurEA0J_vmbx3feHooA2-4YLeMeCHlXNtKNOkw_umoGm40_DvWfXEl9jmVzKQFBD',
      successRate: '92% Success',
      type: 'Weekend',
    },
    {
      id: 'midweek-lunch',
      title: 'Midweek Lunch Offer',
      category: 'seasonal',
      description: 'Drive traffic during slow Tuesday-Thursday windows with meal combo deals.',
      tag: 'High ROAS',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_6l73s0hThTrFh7QvIh8vpQicuuBhvJtVKK-kFeDXwcCtKiP1SUikePNBTF0NwW7G_69VmPT15TT5nSznJb1GcTVC0Oa_515RsTkg0xO4RpJL_JzI5IbnG39shjggDG77iCRit-mKRDN5S0IxCZBbztlf-wAe8NH_0BltjW4i7p7l3gtNOTrEIxwYarITxMvxquofV8NvZrF-sCxJfK7ZHI18IaFcLeTeIiaUPBNYyzxuGvPdb3OOPFk58TAyO_u07GoWp3FNiwaJ',
      successRate: '88% Success',
      type: 'Seasonal',
    },
    {
      id: 'flash-blast',
      title: '2-Hour Flash Blast',
      category: 'flash',
      description: 'Hyper-urgent SMS and Push notification template for inventory clearance.',
      tag: 'Urgent',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzsC-osv1R03yicOu7j37_crg8pC8zd5_0wmaKU99X-kqN22pAaW0dMHmRs7Eow8Itq8Fy7Qo6uQH7yBkDR3jPOEQ7OJiUy8Pe4JKU94TB2I_mlry9be8B88LhqsQyVW2gdnDhdP5klXU5AWp5kuoKCmFZU5_xixtJMa-mOBlq3HyLDY0k0pY7AQ2xmk3q-d8qLpGc-mcbf_mfDYf5XXzuY81SL9sIBvrIteyESX9rWpIpzsMqij5NLCecOaasRdr1C4nWaB0TcbYw',
      successRate: '95% Engagement',
      type: 'Flash',
    },
    {
      id: 'loyalty-welcome',
      title: 'Loyalty Welcome greeting',
      category: 'retention',
      description: 'Automated greeting and first-purchase discount for new member signups.',
      tag: 'Retention',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3Mnd5yXKQBYVTdKqCpkXM4TjBAeYH6Z1ok_nJ6AsN_wfXiN10CAbynockqW5uxv42pE8LjkfNJ_zo4kXS4VIGLZDYbBdCwfBCXjvD1vchfdw-U9xZmR_zF1-79cbqrEWfXxLDQ9OI3cVlhHeBoWG4WdLS8UXrgStDbOSrj2-FXdH69FkmzSUPS4Ru1IklcKgWpMvwrZ8J90QsMMCVEeZ3-2Fne5ksCgHz0mf2JPDFXzMWG2jxwgq_AshUSaIHZDGSFQpe5Ncklkey',
      successRate: '94% Retention',
      type: 'Retention',
    },
  ];

  const handleOpenWizard = (presetId?: string) => {
    if (presetId) {
      const selected = presets.find(p => p.id === presetId);
      if (selected) {
        setSelectedPresetId(selected.id);
        setCustomTitle(selected.title);
        setCustomDesc(selected.description);
        setCampaignType(selected.type);
      }
    }
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const selectPreset = (preset: PresetTemplate) => {
    setSelectedPresetId(preset.id);
    setCustomTitle(preset.title);
    setCustomDesc(preset.description);
    setCampaignType(preset.type);
    handleNextStep();
  };

  const handleNextStep = () => {
    if (wizardStep < 6) {
      setWizardStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (wizardStep > 1) {
      setWizardStep(prev => prev - 1);
    }
  };

  const toggleDistribution = (channel: string) => {
    if (distribution.includes(channel)) {
      setDistribution(distribution.filter(d => d !== channel));
    } else {
      setDistribution([...distribution, channel]);
    }
  };

  const handleActivate = () => {
    const newCampaign: CampaignItem = {
      id: Math.random().toString(),
      title: customTitle,
      type: campaignType,
      status: 'running',
      reached: '0 (New)',
      ctr: '0%',
      conversion: '0%',
      icon: campaignType === 'Flash' ? '⚡' : campaignType === 'Weekend' ? '🎫' : '📢',
    };
    setCampaigns([newCampaign, ...campaigns]);
    setIsWizardOpen(false);
    toast.success('New local campaign successfully activated!');
  };

  const handleStopCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    toast.success('Campaign deactivated.');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header Back Link */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-150 pb-6">
        <div>
          <button 
            onClick={() => router.push('/dashboard/tools')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a14000] hover:text-[#ff6900] mb-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools Overview
          </button>
          <h1 className="text-3xl font-black text-[#0b1c30] tracking-tight">Campaign Manager</h1>
          <p className="text-sm text-[#5a4136]">Access, launch and analyze targeted micro-campaigns and discount events.</p>
        </div>
        <Button 
          onClick={() => handleOpenWizard()}
          className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold px-6 py-6 rounded-xl flex items-center gap-2 shadow-md transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Start New Campaign
        </Button>
      </div>

      {/* Overview Metrics Dashboard Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#a14000] text-white p-6 rounded-3xl relative overflow-hidden border-none shadow-md">
          <div className="relative z-10 space-y-4">
            <span className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Total Monthly Reach</span>
            <h3 className="text-3xl font-black font-mono">18.4k Reached</h3>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="bg-orange-300 h-full rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-3 translate-x-3">
            <Megaphone size={110} />
          </div>
        </Card>

        <Card className="bg-white border border-[#e2bfb0]/30 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#5a4136] uppercase tracking-widest">Average CTR</span>
          <h3 className="text-3xl font-black font-mono text-emerald-600 mt-2">5.4% Click Rate</h3>
          <p className="text-xs text-gray-400 mt-2">Valued higher than sector benchmark (3%).</p>
        </Card>

        <Card className="bg-white border border-[#e2bfb0]/30 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#5a4136] uppercase tracking-widest">Ongoing Banners</span>
          <h3 className="text-3xl font-black font-mono text-[#a14000] mt-2">{campaigns.length} Active</h3>
          <p className="text-xs text-gray-400 mt-2">Displaying live to district feeds.</p>
        </Card>
      </section>

      {/* Main Campaign deck list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Active Campaigns Tracker */}
        <div className="lg:col-span-8 bg-white border border-[#e2bfb0]/30 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-[#0b1c30] flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#ff6900]" />
              Active Campaigns
            </h3>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{campaigns.length} campaigns running</span>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-[#ff6900] flex items-center justify-center mx-auto">
                <Megaphone size={30} />
              </div>
              <div>
                <p className="font-bold text-lg text-[#a14000]">No Running Campaigns</p>
                <p className="text-xs text-[#5a4136]">Your dashboard is quiet. Launch a seasonal or weekend campaign now.</p>
              </div>
              <Button onClick={() => handleOpenWizard()} className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold">
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((item) => (
                <div 
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#f8f9ff] rounded-2xl border border-transparent hover:border-[#ff6900]/30 hover:bg-white transition-all gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <span className="w-12 h-12 rounded-xl bg-orange-50 text-[#ff6900] flex items-center justify-center text-xl shrink-0 font-bold">
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-[#0b1c30] text-sm truncate">{item.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                          item.status === 'running' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-[#a14000]'
                        }`}>{item.status.toUpperCase()}</span>
                      </div>
                      <p className="text-xs text-[#5a4136] mt-0.5">Reach: {item.reached} • CTR: {item.ctr} • Conv: {item.conversion}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                    <Button 
                      variant="ghost"
                      onClick={() => handleStopCampaign(item.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Sparkline / quick metrics */}
        <div className="lg:col-span-4 bg-white border border-[#e2bfb0]/30 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Borough Engagement Sparkline</h4>
            <div className="h-24 flex items-end gap-1.5 pt-4">
              <div className="bg-orange-200/50 hover:bg-[#ff6900] transition-colors flex-1 rounded-t h-[30%]" title="Week 1"></div>
              <div className="bg-orange-200/50 hover:bg-[#ff6900] transition-colors flex-1 rounded-t h-[55%]" title="Week 2"></div>
              <div className="bg-orange-200/50 hover:bg-[#ff6900] transition-colors flex-1 rounded-t h-[40%]" title="Week 3"></div>
              <div className="bg-[#ff6900] flex-1 rounded-t h-[85%]" title="Week 4"></div>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2 font-mono">Engagement spikes 60% after push notifications.</p>
          </div>

          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#ff6900] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-black text-[#a14000]">Preset Power Tip</h5>
              <p className="text-[11px] text-[#5a4136] leading-relaxed">
                Use preset tags: "Urgent" or "Best Seller" increases organic storefront clicks by 18%.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Preset Library Section */}
      <section className="space-y-6 pt-6">
        <div>
          <h3 className="text-xl font-bold text-[#0b1c30] tracking-tight">Campaign Library</h3>
          <p className="text-xs text-[#5a4136]">Choose a preset layout to speed up launch times.</p>
        </div>

        {/* Tab sliders */}
        <div className="flex border-b border-gray-200">
          {(['seasonal', 'weekend', 'flash', 'retention'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab 
                  ? 'border-[#ff6900] text-[#a14000]' 
                  : 'border-transparent text-gray-400 hover:text-[#5a4136]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Template List Deck Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {presets
            .filter(preset => preset.category === activeTab)
            .map((preset) => (
              <div 
                key={preset.id}
                className="bg-white border border-[#e2bfb0]/30 rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 bg-gray-100 relative overflow-hidden">
                    <img 
                      src={preset.image} 
                      alt={preset.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {preset.tag && (
                      <div className="absolute top-2 left-2 bg-[#ff6900] text-white px-2 py-0.5 text-[8px] font-bold uppercase rounded">
                        {preset.tag}
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-bold text-sm text-[#0b1c30]">{preset.title}</h4>
                    <p className="text-[11px] text-[#5a4136] line-clamp-2">{preset.description}</p>
                  </div>
                </div>
                <div className="p-4 pt-0 border-t border-gray-50 flex items-center justify-between text-xs mt-3">
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{preset.successRate}</span>
                  <button 
                    onClick={() => handleOpenWizard(preset.id)}
                    className="text-[#ff6900] font-bold flex items-center gap-1 hover:translate-x-1 transition-transform"
                  >
                    Use <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          {presets.filter(preset => preset.category === activeTab).length === 0 && (
            <p className="text-xs text-gray-400 py-6">No presets currently in this segment.</p>
          )}
        </div>
      </section>

      {/* ----------------- 6-STEP CAMPAIGN CREATOR WIZARD ----------------- */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-[#f8f9ff]">
              <div>
                <span className="text-[9px] font-black uppercase text-[#ff6900] tracking-widest bg-orange-50 px-2 py-0.5 rounded-full">Step {wizardStep} of 6</span>
                <h3 className="text-lg font-black text-[#0b1c30] mt-1">Start New Campaign</h3>
              </div>
              <button 
                onClick={() => setIsWizardOpen(false)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Steps Content */}
            <div className="p-6 flex-grow overflow-y-auto max-h-[400px] space-y-4">
              
              {/* Step 1: Campaign Type */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">1. Campaign Type</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Weekend', 'Seasonal', 'Borough Promo', 'Urgent Flash'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setCampaignType(type)}
                        className={`p-4 border rounded-xl text-xs font-bold text-center transition-all ${
                          campaignType === type 
                            ? 'border-[#ff6900] bg-orange-50 text-[#a14000]' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Preset Template */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">2. Choose Preset Template</h4>
                  <div className="space-y-2">
                    {presets.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => selectPreset(preset)}
                        className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all hover:border-[#ff6900]/50 ${
                          selectedPresetId === preset.id ? 'border-[#ff6900] bg-orange-50' : 'border-gray-200'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-[#0b1c30] block">{preset.title}</span>
                          <span className="text-[10px] text-gray-400">{preset.description}</span>
                        </div>
                        <span className="text-[9px] font-bold text-[#ff6900] bg-orange-50 px-2 py-0.5 rounded">
                          {preset.successRate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Customize details */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">3. Customize Details</h4>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#5a4136]">Campaign Name</label>
                    <input 
                      type="text" 
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full text-gray-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#5a4136]">Description</label>
                    <textarea 
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full text-gray-700 h-16 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#5a4136]">Promo Offer/Value</label>
                      <input 
                        type="text" 
                        value={offerValue}
                        onChange={(e) => setOfferValue(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full text-gray-700"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#5a4136]">Duration</label>
                      <select 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full text-gray-700"
                      >
                        <option value="1 Day">1 Day</option>
                        <option value="3 Days">3 Days</option>
                        <option value="1 Week">1 Week</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Distribution Channels */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">4. Select Distribution Channels</h4>
                  <p className="text-xs text-[#5a4136]">Where should your coupon / flyer campaign be distributed?</p>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'storefront', label: 'Direct Storefront Feed', desc: 'Render on your profile feed page' },
                      { id: 'borough', label: 'Borough Campaign Board', desc: 'Post to your district board center' },
                      { id: 'push', label: 'Targeted SMS & Push alert', desc: 'Alert nearest shoppers with active notifications' },
                      { id: 'qr', label: 'QR Print Flyer generator', desc: 'Print counter poster with redeem code' }
                    ].map((channel) => {
                      const isChecked = distribution.includes(channel.id);
                      return (
                        <div 
                          key={channel.id}
                          onClick={() => toggleDistribution(channel.id)}
                          className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            isChecked ? 'border-[#ff6900] bg-orange-50' : 'border-gray-200'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-[#0b1c30] block">{channel.label}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">{channel.desc}</span>
                          </div>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-[#ff6900] border-transparent text-white' : 'border-gray-300'
                          }`}>
                            {isChecked && <Check className="w-4 h-4" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Live Widget Preview */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">5. Storefront Card Preview</h4>
                  
                  {/* Card Widget Mockup */}
                  <div className="bg-white border border-[#e2bfb0]/30 rounded-3xl p-5 shadow-md space-y-4 max-w-sm mx-auto">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-400 uppercase tracking-widest">{campaignType} Promotion</span>
                      <span className="bg-orange-50 text-[#a14000] px-2 py-0.5 rounded-full text-[9px] font-bold">ACTIVE</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-[#0b1c30] text-md leading-tight">{customTitle}</h4>
                      <p className="text-xs text-[#5a4136] leading-relaxed">{customDesc}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase">Reward Offer</span>
                        <span className="text-xs font-bold text-emerald-600">{offerValue}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-gray-400 block uppercase">Duration</span>
                        <span className="text-xs font-bold text-[#0b1c30] font-mono">{duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Activation */}
              {wizardStep === 6 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 text-[#ff6900] flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-[#a14000]">Ready to Launch!</h4>
                    <p className="text-xs text-[#5a4136] max-w-sm mx-auto">
                      Review details below. Once activated, the campaign pushes live across all selected high street zones.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 border rounded-2xl text-left space-y-1.5 text-xs text-[#5a4136]">
                    <div>• <strong>Type</strong>: {campaignType}</div>
                    <div>• <strong>Title</strong>: {customTitle}</div>
                    <div>• <strong>Value</strong>: {offerValue}</div>
                    <div>• <strong>Channels</strong>: {distribution.join(', ')}</div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t border-gray-100 flex justify-between bg-[#f8f9ff]">
              <Button 
                variant="ghost" 
                onClick={handlePrevStep} 
                disabled={wizardStep === 1}
                className="text-[#5a4136] font-bold"
              >
                Back
              </Button>
              {wizardStep < 6 ? (
                <Button 
                  onClick={handleNextStep}
                  className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold px-6 py-2.5 rounded-xl"
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  onClick={handleActivate}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-6 py-2.5 rounded-xl"
                >
                  Launch Campaign
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
