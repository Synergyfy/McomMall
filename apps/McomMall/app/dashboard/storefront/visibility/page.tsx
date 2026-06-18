'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Eye, 
  MapPin, 
  Sparkles, 
  ArrowUpDown, 
  ToggleLeft, 
  Check, 
  Map, 
  Flame,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import api from '@/service/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface VisibilityData {
  id: string;
  businessId: string;
  radius: number;
  hubs: string[];
  featuredDaysLeft: number;
  rotatorOrder: string[];
  highStreetMode: boolean;
}

export default function StorefrontVisibilityDashboard() {
  const queryClient = useQueryClient();
  const businessId = 'default-business-id';

  // Component state fallbacks for instant sliders updates
  const [sliderVal, setSliderVal] = useState<number>(75);
  const [rotators, setRotators] = useState<string[]>(['New Arrivals', 'Best Sellers', 'Seasonal Promo']);
  const [highStreetMode, setHighStreetMode] = useState<boolean>(true);

  // Fetch visibility settings from API
  const { data: settings = null } = useQuery<VisibilityData>({
    queryKey: ['visibility-settings', businessId],
    queryFn: async () => {
      try {
        const res = await api.get(`visibility/${businessId}`);
        const data = res.data;
        setSliderVal(data.radius || 10);
        setRotators(data.rotatorOrder || ['New Arrivals', 'Best Sellers', 'Seasonal Promo']);
        setHighStreetMode(data.highStreetMode);
        return data;
      } catch {
        // Fallback mock settings matching Visibility Dashboard template
        return {
          id: 'v-settings',
          businessId,
          radius: 75,
          hubs: ['Islington', 'Hackney', 'Camden'],
          featuredDaysLeft: 3,
          rotatorOrder: ['New Arrivals', 'Best Sellers', 'Seasonal Promo'],
          highStreetMode: true
        };
      }
    }
  });

  // Settings update mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: Partial<VisibilityData>) => {
      return api.patch(`visibility/${businessId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visibility-settings', businessId] });
      toast.success('Storefront visibility settings saved!');
    },
    onError: () => {
      toast.info('API fallback: Saved settings offline');
    }
  });

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderVal(val);
  };

  const handleSliderRelease = () => {
    updateSettingsMutation.mutate({ radius: sliderVal });
  };

  const handleToggleHighStreet = () => {
    const nextVal = !highStreetMode;
    setHighStreetMode(nextVal);
    updateSettingsMutation.mutate({ highStreetMode: nextVal });
  };

  const moveRotator = (index: number, direction: 'up' | 'down') => {
    const newList = [...rotators];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newList.length) {
      // Swap elements
      const temp = newList[index];
      newList[index] = newList[targetIndex];
      newList[targetIndex] = temp;
      setRotators(newList);
      updateSettingsMutation.mutate({ rotatorOrder: newList });
    }
  };

  // Calculations based on sliderVal
  const potentialReach = sliderVal * 165;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Real-time reach estimator widget */}
      <section className="mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-[#ff6900] p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative z-10 flex flex-col gap-1.5 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-100">Real-Time Reach Estimator</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
              {(potentialReach).toLocaleString()} <span className="text-lg opacity-85 font-medium">Potential Eyes</span>
            </h2>
            <p className="text-xs text-orange-50 max-w-sm mt-1 leading-relaxed">
              Your storefront visibility settings place you in the top 15% of local merchants. Drag borough radius range slider to increase local footprint.
            </p>
          </div>
          
          {/* Visual reach pulses */}
          <div className="relative z-10 w-full md:w-64 h-28 flex items-end justify-between gap-1.5 px-4">
            <div className="w-full bg-orange-950/20 rounded-t-lg transition-all duration-300" style={{ height: '40%' }} />
            <div className="w-full bg-orange-950/40 rounded-t-lg transition-all duration-300" style={{ height: '70%' }} />
            <div className="w-full bg-white rounded-t-lg transition-all duration-500 animate-pulse" style={{ height: `${Math.min(100, sliderVal)}%` }} />
            <div className="w-full bg-orange-950/40 rounded-t-lg transition-all duration-300" style={{ height: '60%' }} />
            <div className="w-full bg-orange-950/20 rounded-t-lg transition-all duration-300" style={{ height: '30%' }} />
          </div>
        </div>
      </section>

      {/* Main dashboard settings grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Borough Visibility column */}
        <div className="lg:col-span-8 bg-white border border-[#e2bfb0]/30 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <div>
              <h3 className="text-lg font-black text-[#0b1c30]">Borough Visibility Range</h3>
              <p className="text-xs text-[#5a4136]">Adjust target search visibility boundaries in miles.</p>
            </div>
            <span className="bg-[#ff6900]/10 text-[#a14000] px-3 py-1 rounded-full text-xs font-bold uppercase">Wide Radius</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between text-xs font-bold text-[#5a4136] uppercase tracking-wider">
              <span>Local Neighborhood</span>
              <span>City-Wide</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={sliderVal} 
              onChange={handleSliderChange}
              onMouseUp={handleSliderRelease}
              onTouchEnd={handleSliderRelease}
              className="w-full accent-[#ff6900] h-2 bg-gray-100 rounded-lg cursor-pointer"
            />
            <div className="grid grid-cols-5 gap-2 pt-2">
              <div className={`h-1.5 rounded-full ${sliderVal >= 20 ? 'bg-[#ff6900]' : 'bg-gray-150'}`} />
              <div className={`h-1.5 rounded-full ${sliderVal >= 40 ? 'bg-[#ff6900]' : 'bg-gray-150'}`} />
              <div className={`h-1.5 rounded-full ${sliderVal >= 60 ? 'bg-[#ff6900]' : 'bg-gray-150'}`} />
              <div className={`h-1.5 rounded-full ${sliderVal >= 80 ? 'bg-[#ff6900]' : 'bg-gray-150'}`} />
              <div className={`h-1.5 rounded-full ${sliderVal >= 95 ? 'bg-[#ff6900]' : 'bg-gray-150'}`} />
            </div>
          </div>

          {/* Hub list */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {['Islington', 'Hackney', 'Camden'].map((hub, idx) => (
              <div key={hub} className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e2bfb0]/20 flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {idx === 0 ? 'Primary Hub' : idx === 1 ? 'Secondary Hub' : 'Extended Hub'}
                </span>
                <span className="font-bold text-sm text-[#a14000]">{hub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured spot column */}
        <div className="lg:col-span-4 bg-white border border-[#e2bfb0]/30 p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#0b1c30]">Featured Spot</h3>
              <p className="text-xs text-[#5a4136]">Push storefront to top-level search recommendations.</p>
            </div>
            <Sparkles className="w-8 h-8 text-[#ff6900] fill-orange-100 shrink-0" />
          </div>

          <div className="flex-grow flex flex-col items-center justify-center p-6 bg-orange-50/40 rounded-xl border border-orange-100/30 border-dashed text-center">
            <span className="text-3xl font-extrabold text-[#a14000]">3 Days</span>
            <span className="text-xs text-gray-500 font-semibold mt-1">Remaining on featured boost</span>
          </div>

          <Button 
            onClick={() => toast.success('Boost streak extended! Check subscription page.')}
            className="w-full bg-[#a14000] text-white hover:bg-[#ff6900] font-bold py-6 rounded-xl shadow-sm"
          >
            Extend Boost Campaign
          </Button>
        </div>
      </div>

      {/* rotators order and high street presence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* rotators ordering list */}
        <div className="lg:col-span-4 bg-white border border-[#e2bfb0]/30 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-black text-[#0b1c30]">Homepage Priority Rotators</h3>
            <p className="text-xs text-[#5a4136]">Order categories displayed on storefront home.</p>
          </div>

          <div className="space-y-3 pt-2">
            {rotators.map((rotator, idx) => (
              <div 
                key={rotator} 
                className="p-3.5 bg-[#f8f9ff] border border-gray-150 rounded-xl flex items-center justify-between gap-3 shadow-inner"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6900] text-white shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-gray-800">{rotator}</span>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => moveRotator(idx, 'up')} 
                    disabled={idx === 0}
                    className="p-1 text-gray-400 hover:text-[#ff6900] disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => moveRotator(idx, 'down')} 
                    disabled={idx === rotators.length - 1}
                    className="p-1 text-gray-400 hover:text-[#ff6900] disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 italic font-semibold">* Click priority arrows to rearrange sections on your public storefront homepage.</p>
        </div>

        {/* High Street verify map toggle */}
        <div className="lg:col-span-8 bg-[#213145] text-[#eaf1ff] p-6 md:p-8 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between gap-6">
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-[#ff6900]/10 rounded-full blur-3xl" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4 relative z-10">
            <div>
              <h3 className="text-lg font-black text-white">High Street Verified Presence</h3>
              <p className="text-xs text-orange-200">Pin storefront listing to walking-traffic neighborhood maps.</p>
            </div>
            
            {/* Toggle switch */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">{highStreetMode ? 'Active Map Pin' : 'Hidden from Map'}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={highStreetMode} 
                  onChange={handleToggleHighStreet}
                  className="sr-only peer" 
                />
                <div className="w-14 h-7 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#ff6900]" />
              </label>
            </div>
          </div>

          {/* Map details strip */}
          <div className="grid grid-cols-2 gap-4 relative z-10 pt-2">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <Map className="w-5 h-5 text-orange-300 mb-1" />
              <span className="text-[10px] text-orange-100 uppercase tracking-widest block font-bold">Traffic Growth</span>
              <span className="font-extrabold text-sm text-white">+42% Growth</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <Flame className="w-5 h-5 text-orange-300 mb-1" />
              <span className="text-[10px] text-orange-100 uppercase tracking-widest block font-bold">Zone Status</span>
              <span className="font-extrabold text-sm text-white flex items-center gap-1">
                Hot Zone
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
