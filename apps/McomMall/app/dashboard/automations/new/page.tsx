'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useGetUserListings } from '@/service/listings/hook';
import { 
  ArrowLeft, 
  Settings, 
  MapPin, 
  Users, 
  MessageSquare, 
  Mail, 
  Bell, 
  ChevronRight,
  Save,
  Clock,
  Play,
  Shuffle,
  Store
} from 'lucide-react';
import api from '@/service/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

type TriggerType = 'weekly' | 'monthly' | 'seasonal' | 'borough';

export default function AutomationFlowBuilder() {
  const router = useRouter();

  // Retrieve actual user listing ID
  const { data: listingsData, isLoading: isLoadingListing } = useGetUserListings(1, 1);
  const listing = listingsData?.data?.[0];
  const businessId = listing?.id;

  // Campaign configurations
  const [name, setName] = useState<string>('My Sourdough Promotion Campaign');
  const [triggerType, setTriggerType] = useState<TriggerType>('weekly');
  const [radius, setRadius] = useState<number>(5);
  const [selectedTiers, setSelectedTiers] = useState<string[]>(['Loyal', 'New']);
  const [actionChannel, setActionChannel] = useState<string>('push');

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!businessId) {
        throw new Error('No active business storefront listing associated with this profile.');
      }
      const payload = {
        businessId,
        name,
        triggerType,
        targetRadius: radius,
        customerTiers: selectedTiers,
        isActive: true,
        flowConfig: {
          actionChannel,
        }
      };
      return api.post('automations', payload);
    },
    onSuccess: () => {
      toast.success('Automation workflow saved and activated!');
      router.push('/dashboard/automations');
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to save automation';
      toast.error(`Error saving workflow: ${errMsg}`);
    }
  });

  const toggleTier = (tier: string) => {
    if (selectedTiers.includes(tier)) {
      setSelectedTiers(selectedTiers.filter(t => t !== tier));
    } else {
      setSelectedTiers([...selectedTiers, tier]);
    }
  };

  const handleSave = () => {
    if (!name) {
      toast.error('Please name your automation campaign');
      return;
    }
    createMutation.mutate();
  };

  if (isLoadingListing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9ff]">
        <div className="w-8 h-8 border-4 border-[#ff6900] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 shadow-md border-[#e2bfb0]/30 bg-white rounded-2xl">
          <CardHeader className="flex flex-col items-center space-y-2 pb-2">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-[#ff6900] mb-2">
              <Store size={36} />
            </div>
            <CardTitle className="text-2xl font-bold text-[#a14000]">No Storefront Found</CardTitle>
            <CardDescription className="text-xs text-[#5a4136]">
              Create a business profile first to design automation workflows.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button
              className="w-full bg-[#ff6900] hover:bg-[#a14000] text-white font-bold py-6 rounded-xl shadow-sm transition-colors"
              onClick={() => router.push('/dashboard/add-listing')}
            >
              Add Business Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header back button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-150 pb-6">
        <div>
          <button 
            onClick={() => router.push('/dashboard/automations')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a14000] hover:text-[#ff6900] mb-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Automations
          </button>
          <h1 className="text-3xl font-black text-[#0b1c30] tracking-tight">Campaign Flow Builder</h1>
          <p className="text-sm text-[#5a4136]">Design flowchart trees to deliver automated deals and announcements.</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={createMutation.isPending}
          className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold px-5 py-6 rounded-xl flex items-center gap-2 shadow-md transition-all"
        >
          <Save className="w-5 h-5" />
          {createMutation.isPending ? 'Saving Flow...' : 'Save Automation Flow'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Config Panel */}
        <div className="lg:col-span-5 bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 space-y-6 shadow-sm">
          
          {/* Campaign Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#5a4136] uppercase tracking-wider">Workflow Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full"
            />
          </div>

          {/* Trigger selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#5a4136] uppercase tracking-wider block">1. Choose Trigger Condition</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'weekly', label: 'Weekly Cron', icon: <Clock className="w-4 h-4" />, desc: 'Every Monday 8AM' },
                { type: 'monthly', label: 'Monthly Blast', icon: <Clock className="w-4 h-4" />, desc: '1st of the month' },
                { type: 'seasonal', label: 'Seasonal Fest', icon: <Clock className="w-4 h-4" />, desc: 'Major holidays' },
                { type: 'borough', label: 'Borough Proximity', icon: <MapPin className="w-4 h-4" />, desc: 'Customer enters zone' }
              ].map((t) => (
                <button
                  key={t.type}
                  onClick={() => setTriggerType(t.type as TriggerType)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                    triggerType === t.type 
                      ? 'border-[#ff6900] bg-[#ff6900]/5 text-[#a14000]' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {t.icon}
                    {t.label}
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Radius (if Borough trigger) */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#5a4136] uppercase tracking-wider">2. Proximity Target Radius</label>
              <span className="text-xs font-extrabold text-[#ff6900] bg-orange-50 px-2 py-0.5 rounded-full">{radius} miles</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="25" 
              value={radius} 
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full accent-[#ff6900]"
            />
          </div>

          {/* Target Customer Tiers */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <label className="text-xs font-bold text-[#5a4136] uppercase tracking-wider block">3. Target Audience Tiers</label>
            <div className="flex flex-wrap gap-2">
              {['Loyal', 'New', 'Inactive', 'Local Residents', 'Tourists'].map((tier) => {
                const isChecked = selectedTiers.includes(tier);
                return (
                  <button
                    key={tier}
                    onClick={() => toggleTier(tier)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      isChecked 
                        ? 'border-[#ff6900] bg-[#ff6900]/5 text-[#a14000]' 
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {tier}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Channel */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <label className="text-xs font-bold text-[#5a4136] uppercase tracking-wider block">4. Communication Action Node</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { channel: 'push', label: 'Push Alert', icon: <Bell className="w-4 h-4" /> },
                { channel: 'sms', label: 'SMS text', icon: <MessageSquare className="w-4 h-4" /> },
                { channel: 'email', label: 'Email blast', icon: <Mail className="w-4 h-4" /> }
              ].map((c) => (
                <button
                  key={c.channel}
                  onClick={() => setActionChannel(c.channel)}
                  className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                    actionChannel === c.channel 
                      ? 'border-[#ff6900] bg-[#ff6900]/5 text-[#a14000]' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {c.icon}
                  {c.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Flowchart Canvas */}
        <div className="lg:col-span-7 bg-[#0b1c30] border border-gray-900 rounded-2xl p-6 min-h-[500px] flex flex-col justify-between text-white relative shadow-lg overflow-hidden">
          
          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8">
            <span className="text-xs uppercase tracking-wider text-orange-200 font-extrabold flex items-center gap-1">
              <Shuffle className="w-4 h-4" />
              Live Flowchart Canvas
            </span>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Settings className="w-3.5 h-3.5" />
              Auto-updating
            </div>
          </div>

          {/* Visual Canvas Nodes */}
          <div className="flex-grow flex flex-col items-center justify-center space-y-8 py-8 relative">
            
            {/* Start Trigger Node */}
            <div className="bg-orange-600 border border-orange-500 p-4 rounded-xl text-center w-64 shadow-md transform hover:scale-105 transition-transform">
              <div className="text-[10px] text-orange-100 uppercase tracking-widest font-bold">Trigger Node</div>
              <div className="font-bold text-sm mt-1 capitalize">{triggerType} Trigger Activation</div>
              {triggerType === 'borough' && (
                <div className="text-[10px] text-orange-200 mt-0.5">Radius condition: Within {radius}mi</div>
              )}
            </div>

            {/* Arrow down */}
            <div className="h-8 w-0.5 bg-white/20 relative">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-white/30" />
            </div>

            {/* Conditional Filter Splits Node */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center w-64 shadow-md relative">
              <div className="text-[10px] text-orange-300 uppercase tracking-widest font-bold">Condition Split</div>
              <div className="font-bold text-sm mt-1">Check Customer Tier</div>
              <div className="text-[10px] text-white/60 mt-1.5 flex flex-wrap gap-1 justify-center">
                {selectedTiers.map(t => (
                  <span key={t} className="bg-white/10 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>

            {/* Arrow down */}
            <div className="h-8 w-0.5 bg-white/20 relative">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-white/30" />
            </div>

            {/* Dispatch Action Node */}
            <div className="bg-emerald-600 border border-emerald-500 p-4 rounded-xl text-center w-64 shadow-md transform hover:scale-105 transition-transform">
              <div className="text-[10px] text-emerald-100 uppercase tracking-widest font-bold">Dispatch Node</div>
              <div className="font-bold text-sm mt-1 flex items-center justify-center gap-1">
                Send {actionChannel.toUpperCase()} message
              </div>
              <div className="text-[10px] text-emerald-200 mt-0.5">Includes linked coupon voucher details</div>
            </div>

          </div>

          <div className="mt-8 pt-4 border-t border-white/10 text-xs text-white/50 text-center flex items-center justify-center gap-1">
            <Play className="w-3.5 h-3.5" />
            Once saved, this workflow will listen for trigger updates in the background.
          </div>
        </div>

      </div>

    </div>
  );
}
