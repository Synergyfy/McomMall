'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
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
  Send,
  Map,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface SentAlert {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  reached: number;
  openRate: number;
  ctr: number;
  type: string;
}

interface AlertTemplate {
  id: string;
  title: string;
  body: string;
  type: string;
}

export default function PushNotificationCenter() {
  const router = useRouter();

  // History Log of Sent Alerts
  const [alerts, setAlerts] = useState<SentAlert[]>([
    {
      id: '1',
      title: 'Flash Lunch Offer ending soon!',
      body: 'Get 25% off all lunch combos for the next 45 minutes. Claim now!',
      sentAt: 'Today, 12:00 PM',
      reached: 1240,
      openRate: 45,
      ctr: 18,
      type: 'Flash Deal',
    },
    {
      id: '2',
      title: 'Tonight\'s Live Session starts in 1 Hour',
      body: 'Grab your premium front row slots. Complimentary drinks for members.',
      sentAt: 'Yesterday, 6:00 PM',
      reached: 850,
      openRate: 62,
      ctr: 24,
      type: 'Event Reminder',
    },
  ]);

  // Radius check-in state
  const [targetRadius, setTargetRadius] = useState(2);

  // Wizard state machine (1 to 6 steps)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard form inputs
  const [alertType, setAlertType] = useState('Flash Deal');
  const [selectedPresetId, setSelectedPresetId] = useState('lunch-end');
  const [messageTitle, setMessageTitle] = useState('Lunch Deal Ending Soon!');
  const [messageBody, setMessageBody] = useState('Hurry! Only 15 minutes left to grab 30% off our artisanal sandwiches.');
  const [actionLink, setActionLink] = useState('storefront');
  const [selectedAudience, setSelectedAudience] = useState<string[]>(['nearby']);
  const [scheduleOption, setScheduleOption] = useState<'now' | 'later' | 'recurring'>('now');
  const [scheduledTime, setScheduledTime] = useState('2026-06-18T18:00');

  // Templates list
  const templates: AlertTemplate[] = [
    {
      id: 'lunch-end',
      title: 'Lunch Deal Ending Soon!',
      body: 'Hurry! Only 15 minutes left to grab 30% off our artisanal sandwiches.',
      type: 'Flash Deal',
    },
    {
      id: 'event-hour',
      title: 'Tonight\'s Event Starts in 1 Hour!',
      body: 'Don\'t miss our high street live tasting. Walk-ins open.',
      type: 'Event Reminder',
    },
    {
      id: 'spin-win',
      title: 'Spin Reward Available!',
      body: 'You have earned a free loyalty spin. Unlock immediate discounts now.',
      type: 'Reward Alert',
    },
    {
      id: 'seat-open',
      title: 'Empty seats tonight?',
      body: 'Quiet evening? Book a dinner spot in the next 10 minutes and save 20%.',
      type: 'Capacity Alert',
    },
  ];

  const handleOpenWizard = (presetId?: string) => {
    if (presetId) {
      const selected = templates.find(t => t.id === presetId);
      if (selected) {
        setSelectedPresetId(selected.id);
        setMessageTitle(selected.title);
        setMessageBody(selected.body);
        setAlertType(selected.type);
      }
    }
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const selectPreset = (preset: AlertTemplate) => {
    setSelectedPresetId(preset.id);
    setMessageTitle(preset.title);
    setMessageBody(preset.body);
    setAlertType(preset.type);
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

  const toggleAudience = (segment: string) => {
    if (selectedAudience.includes(segment)) {
      setSelectedAudience(selectedAudience.filter(s => s !== segment));
    } else {
      setSelectedAudience([...selectedAudience, segment]);
    }
  };

  const handleActivate = () => {
    const newAlert: SentAlert = {
      id: Math.random().toString(),
      title: messageTitle || 'Neighborhood Update',
      body: messageBody,
      sentAt: scheduleOption === 'now' ? 'Just Now' : `Scheduled for ${scheduledTime}`,
      reached: scheduleOption === 'now' ? Math.floor(1000 + Math.random() * 500) : 0,
      openRate: 0,
      ctr: 0,
      type: alertType,
    };
    setAlerts([newAlert, ...alerts]);
    setIsWizardOpen(false);
    toast.success(scheduleOption === 'now' ? 'Push notification dispatched immediately!' : 'Notification schedule registered.');
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast.success('Alert record deleted.');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header back button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-150 pb-6">
        <div>
          <button 
            onClick={() => router.push('/dashboard/tools')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a14000] hover:text-[#ff6900] mb-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools Overview
          </button>
          <h1 className="text-3xl font-black text-[#0b1c30] tracking-tight">Push Notification Center</h1>
          <p className="text-sm text-[#5a4136]">Broadcast real-time high-street alerts to neighboring mobile devices instantly.</p>
        </div>
        <Button 
          onClick={() => handleOpenWizard()}
          className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold px-6 py-6 rounded-xl flex items-center gap-2 shadow-md transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Send Push Notification
        </Button>
      </div>

      {/* Summary Metrics cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#a14000] text-white p-6 rounded-3xl relative overflow-hidden border-none shadow-md">
          <div className="relative z-10 space-y-4">
            <span className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Neighborhood Reach</span>
            <h3 className="text-3xl font-black font-mono">4,520 Total Sent</h3>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="bg-orange-300 h-full rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-3 translate-x-3">
            <Bell size={110} />
          </div>
        </Card>

        <Card className="bg-white border border-[#e2bfb0]/30 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#5a4136] uppercase tracking-widest">AVERAGE OPEN RATE</span>
          <h3 className="text-3xl font-black font-mono text-emerald-600 mt-2">53.5% Opened</h3>
          <p className="text-xs text-gray-400 mt-2">Sector benchmark average is 20%.</p>
        </Card>

        <Card className="bg-white border border-[#e2bfb0]/30 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#5a4136] uppercase tracking-widest">Neighborhood CTR</span>
          <h3 className="text-3xl font-black font-mono text-[#a14000] mt-2">21.0% CTR</h3>
          <p className="text-xs text-gray-400 mt-2">Actions triggered from lock screens.</p>
        </Card>
      </section>

      {/* Dispatch History & Radar Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Sent Notifications Log */}
        <div className="lg:col-span-8 bg-white border border-[#e2bfb0]/30 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-[#0b1c30] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#ff6900]" />
              Sent Announcements Log
            </h3>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{alerts.length} history records</span>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-[#ff6900] flex items-center justify-center mx-auto">
                <Bell size={30} />
              </div>
              <div>
                <p className="font-bold text-lg text-[#a14000]">No Sent Alerts</p>
                <p className="text-xs text-[#5a4136]">Dispatch your first broadcast push alert using our wizard builder.</p>
              </div>
              <Button onClick={() => handleOpenWizard()} className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold">
                Build Notification
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((item) => (
                <div 
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#f8f9ff] rounded-2xl border border-transparent hover:border-[#ff6900]/30 hover:bg-white transition-all gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <span className="w-12 h-12 rounded-xl bg-orange-50 text-[#ff6900] flex items-center justify-center text-xl shrink-0 font-bold">
                      📢
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-[#0b1c30] text-sm truncate">{item.title}</h4>
                        <span className="bg-orange-50 text-[#a14000] px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0">{item.type}</span>
                      </div>
                      <p className="text-xs text-[#5a4136] mt-0.5">{item.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-semibold">{item.sentAt} • Reached {item.reached} users • {item.openRate}% Opened</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                    <Button 
                      variant="ghost"
                      onClick={() => handleRemoveAlert(item.id)}
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

        {/* Right Column: Concentric CSS Radar Map Heatmap & Quick Templates */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white border border-[#e2bfb0]/30 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h4 className="text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
                <Map className="w-4 h-4 text-[#ff6900]" />
                Live Broadcast Heatmap
              </h4>
              <span className="text-[10px] text-gray-400 font-mono">2 Mile radius</span>
            </div>

            {/* Radar / Heatmap representation using CSS Concentric Circles & Animations */}
            <div className="flex items-center justify-center py-6">
              <div className="relative w-40 h-40 rounded-full border border-[#ff6900]/20 flex items-center justify-center bg-[#f8f9ff]">
                
                {/* Concentric rings */}
                <div className="absolute w-32 h-32 rounded-full border border-[#ff6900]/30 flex items-center justify-center"></div>
                <div className="absolute w-24 h-24 rounded-full border border-[#ff6900]/40 flex items-center justify-center"></div>
                <div className="absolute w-16 h-16 rounded-full border border-[#ff6900]/50 flex items-center justify-center"></div>
                
                {/* Pulsing beacon circles */}
                <div className="absolute w-12 h-12 bg-[#ff6900]/15 rounded-full animate-ping"></div>
                <div className="absolute w-6 h-6 bg-[#ff6900]/35 rounded-full animate-pulse"></div>
                <div className="absolute w-3 h-3 bg-[#a14000] rounded-full shadow-lg z-10"></div>
                
                {/* Random heat dots */}
                <span className="absolute top-8 left-8 w-2 h-2 rounded-full bg-emerald-500/80 shadow-md"></span>
                <span className="absolute top-14 right-10 w-2.5 h-2.5 rounded-full bg-orange-500/80 shadow-md"></span>
                <span className="absolute bottom-12 left-12 w-2 h-2 rounded-full bg-orange-500/80 shadow-md"></span>
                <span className="absolute bottom-6 right-14 w-2 h-2 rounded-full bg-emerald-500/80 shadow-md"></span>
              </div>
            </div>

            {/* Heatmap Stats description */}
            <div className="p-3 bg-[#f8f9ff] border border-gray-150 rounded-2xl text-[11px] text-[#5a4136] space-y-1">
              <div className="flex justify-between">
                <span>Southwark Center density</span>
                <span className="font-bold text-emerald-600">High (1,240 users)</span>
              </div>
              <div className="flex justify-between">
                <span>Borough Outer boundary</span>
                <span className="font-bold text-orange-500">Medium (620 users)</span>
              </div>
            </div>
          </Card>

          <Card className="bg-white border border-[#e2bfb0]/30 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quick Trigger Templates</h4>
            <div className="space-y-2">
              {templates.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleOpenWizard(preset.id)}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-[#ff6900]/40 bg-[#f8f9ff] hover:bg-white transition-all text-xs flex justify-between items-center group font-medium"
                >
                  <div>
                    <span className="font-bold text-[#0b1c30] block">{preset.title}</span>
                    <span className="text-[10px] text-gray-400">{preset.type}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#ff6900] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* ----------------- 6-STEP NOTIFICATION DISPATCH WIZARD ----------------- */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-[#f8f9ff]">
              <div>
                <span className="text-[9px] font-black uppercase text-[#ff6900] tracking-widest bg-orange-50 px-2 py-0.5 rounded-full">Step {wizardStep} of 6</span>
                <h3 className="text-lg font-black text-[#0b1c30] mt-1">Send Neighborhood Push</h3>
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
              
              {/* Step 1: Alert Type */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">1. Select Alert Category</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Flash Deal', 'Reward Alert', 'Event Reminder', 'Capacity Alert'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setAlertType(type)}
                        className={`p-4 border rounded-xl text-xs font-bold text-center transition-all ${
                          alertType === type 
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

              {/* Step 2: Choose Template */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">2. Choose Preset Message</h4>
                  <div className="space-y-2">
                    {templates
                      .filter(t => t.type === alertType || !alertType)
                      .map((preset) => (
                        <div
                          key={preset.id}
                          onClick={() => selectPreset(preset)}
                          className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all hover:border-[#ff6900]/50 ${
                            selectedPresetId === preset.id ? 'border-[#ff6900] bg-orange-50' : 'border-gray-200'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-[#0b1c30] block">{preset.title}</span>
                            <span className="text-[10px] text-gray-400">{preset.body}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Step 3: Message details */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">3. Edit Broadcast Message</h4>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#5a4136]">Notification Title (Headline)</label>
                    <input 
                      type="text" 
                      value={messageTitle}
                      onChange={(e) => setMessageTitle(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full text-gray-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#5a4136]">Notification Body Message</label>
                    <textarea 
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full text-gray-700 h-16 resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#5a4136]">Customer Deep-Link Action</label>
                    <select
                      value={actionLink}
                      onChange={(e) => setActionLink(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full text-gray-700"
                    >
                      <option value="storefront">Open Storefront Hub</option>
                      <option value="coupon">Claim Voucher Page</option>
                      <option value="slots">Table Booking Reservation</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 4: Audience filters */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">4. Select Audience Segment</h4>
                  <p className="text-xs text-[#5a4136]">Choose which nearby cohort is alerted:</p>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'nearby', label: 'Nearby Customers (Live Radar)', desc: 'Users currently within a 2-mile live radius' },
                      { id: 'loyalty', label: 'VIP Members Club only', desc: 'Notify top tier repeat customers' },
                      { id: 'inactive', label: 'Inactive customers (Win back)', desc: 'Notify users who haven\'t visited in 30 days' },
                      { id: 'all', label: 'Broadcast to all Borough users', desc: 'District wide notification channel' }
                    ].map((audience) => {
                      const isChecked = selectedAudience.includes(audience.id);
                      return (
                        <div 
                          key={audience.id}
                          onClick={() => toggleAudience(audience.id)}
                          className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            isChecked ? 'border-[#ff6900] bg-orange-50' : 'border-gray-200'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-[#0b1c30] block">{audience.label}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">{audience.desc}</span>
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

              {/* Step 5: Mobile Lock Screen Preview */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">5. Lock Screen Preview</h4>
                  
                  {/* Smartphone preview mockup */}
                  <div className="bg-slate-900 rounded-3xl p-4 text-white max-w-xs mx-auto border-8 border-slate-800 shadow-lg space-y-4">
                    <div className="flex justify-between items-center text-[10px] opacity-65">
                      <span>Live Broadcast</span>
                      <span>McomMall alert</span>
                    </div>
                    {/* Mock push card */}
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-300">
                        <Bell className="w-3 h-3" />
                        <span>{alertType.toUpperCase()}</span>
                      </div>
                      <h5 className="font-bold text-xs">{messageTitle}</h5>
                      <p className="text-[10px] opacity-75 leading-relaxed">{messageBody}</p>
                    </div>
                    <div className="text-center text-[9px] text-white/50">Tap to unlock & redeem discount</div>
                  </div>
                </div>
              )}

              {/* Step 6: Dispatch options */}
              {wizardStep === 6 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#a14000] uppercase tracking-wider">6. Dispatch Scheduling</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'now', label: 'Send Now' },
                      { id: 'later', label: 'Schedule Later' },
                      { id: 'recurring', label: 'Set Recurring' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setScheduleOption(opt.id as any)}
                        className={`p-3 border rounded-xl text-xs font-bold text-center transition-all ${
                          scheduleOption === opt.id 
                            ? 'border-[#ff6900] bg-orange-50 text-[#a14000]' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {scheduleOption === 'later' && (
                    <div className="flex flex-col gap-1.5 pt-2">
                      <label className="text-xs font-bold text-[#5a4136]">Scheduled Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full text-gray-700"
                      />
                    </div>
                  )}

                  {scheduleOption === 'recurring' && (
                    <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl text-xs text-[#5a4136] leading-relaxed">
                      <strong>Recurring Alerts Configured</strong>: Pushes are sent automatically every Friday at 12:00 PM to matching target segments.
                    </div>
                  )}
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
                  {scheduleOption === 'now' ? 'Dispatch Immediate push' : 'Schedule Notification'}
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
