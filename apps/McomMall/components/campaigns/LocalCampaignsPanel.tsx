'use client';
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useGeoContext } from '@/context/GeoContext';
import { Users, Crosshair, Plus, Calendar } from 'lucide-react';
import GeoBadge from '../badges/GeoBadge';
import api from '@/service/api';

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocalCampaignsPanel({ isOpen, onOpenChange }: Props) {
  const { badge, nearestHighStreet, postcode } = useGeoContext();
  const [consumerCount, setConsumerCount] = useState<number>(0);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const url = postcode 
          ? `localmall/customer/feed?postcode=${encodeURIComponent(postcode)}` 
          : 'localmall/customer/feed';
        const res = await api.get(url);
        if (res.data) {
          setConsumerCount(res.data.consumerCount ?? 0);
          setActiveCampaigns(res.data.activeCampaigns ?? []);
        }
      } catch (err) {
        console.error('Error fetching campaign panel feed:', err);
      }
    };

    fetchData();
  }, [isOpen, postcode]);

  if (!badge || !nearestHighStreet) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-gray-50 p-0 border-l border-gray-200">
        <div className="p-6 bg-white border-b border-gray-100">
          <SheetHeader className="text-left mb-4">
            <div className="flex flex-col gap-3 mb-2">
              <SheetTitle className="text-2xl font-bold text-gray-900">Local Campaigns</SheetTitle>
              <div className="self-start">
                <GeoBadge type={badge} />
              </div>
            </div>
            <SheetDescription className="text-gray-500 text-base">
              Manage your targeted reach within the {nearestHighStreet.name} ecosystem.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Insights Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Live Ecosystem Data</h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{consumerCount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Active consumers in a {nearestHighStreet.radiusMiles}mi radius</p>
              </div>
            </div>
          </div>

          {/* New Campaign Button */}
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-4 flex items-center justify-center gap-2 font-semibold transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            Launch Targeted Campaign
          </button>
          <p className="text-xs text-center text-gray-400 mt-2">
            Targeting will automatically lock to {nearestHighStreet.name} (+{nearestHighStreet.radiusMiles}mi).
          </p>

          {/* Active Hub Campaigns */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">High Street Hub Expos</h4>
            
            <div className="space-y-3">
              {activeCampaigns.length > 0 ? (
                activeCampaigns.map((camp, i) => (
                  <div key={camp.id || i} className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm hover:border-amber-300 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{camp.title}</h5>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Budget: £{camp.budget?.toLocaleString()}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1"><Crosshair className="w-3 h-3" /> {nearestHighStreet.name}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Expires in {camp.expires}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
                  No active community campaigns running in this local mall ecosystem yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
