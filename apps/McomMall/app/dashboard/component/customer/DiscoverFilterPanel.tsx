'use client';

import React, { useState } from 'react';
import {
  X, RotateCcw, Check, SlidersHorizontal, Utensils, Shirt, Palette,
  Dumbbell, Monitor, Ticket, MapPin, Zap, Gift, Star, Calendar,
  Layers, BookOpen,
} from 'lucide-react';

interface FilterState {
  categories: string[];
  distance: string | null;
  offers: string[];
  events: string[];
}

interface DiscoverFilterPanelProps {
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const CATEGORIES = [
  { id: 'restaurants', label: 'Restaurants', icon: Utensils },
  { id: 'beauty', label: 'Beauty', icon: Palette },
  { id: 'fashion', label: 'Fashion', icon: Shirt },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'electronics', label: 'Electronics', icon: Monitor },
  { id: 'entertainment', label: 'Entertainment', icon: Ticket },
];

const DISTANCES = ['1km', '5km', '10km', 'Borough Only'];

const OFFER_TYPES = [
  { id: 'discounts', label: 'Discounts', icon: Tag },
  { id: 'flash', label: 'Flash Deals', icon: Zap },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'loyalty', label: 'Loyalty', icon: Star },
  { id: 'gamification', label: 'Gamification', icon: Layers },
];

const EVENT_TYPES = [
  { id: 'workshops', label: 'Workshops', icon: BookOpen },
  { id: 'live', label: 'Live Events', icon: Calendar },
  { id: 'promotions', label: 'Promotions', icon: Tag },
  { id: 'expo', label: 'Expo Events', icon: Layers },
];

function Tag({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}

export const DiscoverFilterPanel: React.FC<DiscoverFilterPanelProps> = ({ onClose, onApply, showToast }) => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    distance: null,
    offers: [],
    events: [],
  });

  const toggleCategory = (id: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(id) ? prev.categories.filter(c => c !== id) : [...prev.categories, id],
    }));
  };

  const toggleOffer = (id: string) => {
    setFilters(prev => ({
      ...prev,
      offers: prev.offers.includes(id) ? prev.offers.filter(o => o !== id) : [...prev.offers, id],
    }));
  };

  const toggleEvent = (id: string) => {
    setFilters(prev => ({
      ...prev,
      events: prev.events.includes(id) ? prev.events.filter(e => e !== id) : [...prev.events, id],
    }));
  };

  const handleReset = () => {
    setFilters({ categories: [], distance: null, offers: [], events: [] });
    showToast('Filters reset', 'info');
  };

  const handleSavePrefs = () => {
    showToast('Preferences saved!', 'success');
  };

  const selectedCount = filters.categories.length + (filters.distance ? 1 : 0) + filters.offers.length + filters.events.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-[#e2bfb0]/30">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#a14000]" />
            <h2 className="text-base font-extrabold text-[#261812]">Filters</h2>
            {selectedCount > 0 && (
              <span className="bg-[#a14000] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{selectedCount}</span>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-[#8e7164] hover:text-[#a14000] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Category Filters */}
          <section>
            <h3 className="text-xs font-bold text-[#261812] mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#a14000]" />
              Categories
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = filters.categories.includes(cat.id);
                return (
                  <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-[10px] font-semibold transition-all active:scale-95 ${
                      isActive ? 'bg-[#a14000] text-white border-[#a14000]' : 'bg-white text-[#5a4136] border-[#e2bfb0]/30 hover:border-[#a14000]/30'
                    }`}>
                    <Icon className="w-5 h-5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Distance Filters */}
          <section>
            <h3 className="text-xs font-bold text-[#261812] mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#a14000]" />
              Distance
            </h3>
            <div className="flex gap-2 flex-wrap">
              {DISTANCES.map(d => {
                const isActive = filters.distance === d;
                return (
                  <button key={d} onClick={() => setFilters(prev => ({ ...prev, distance: isActive ? null : d }))}
                    className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                      isActive ? 'bg-[#a14000] text-white shadow-sm' : 'bg-[#ffeae1] text-[#5a4136] hover:bg-[#f8ddd2]'
                    }`}>
                    {d}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Offer Filters */}
          <section>
            <h3 className="text-xs font-bold text-[#261812] mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#a14000]" />
              Offer Types
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {OFFER_TYPES.map(off => {
                const Icon = off.icon;
                const isActive = filters.offers.includes(off.id);
                return (
                  <button key={off.id} onClick={() => toggleOffer(off.id)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-[10px] font-semibold transition-all active:scale-95 ${
                      isActive ? 'bg-[#a14000] text-white border-[#a14000]' : 'bg-white text-[#5a4136] border-[#e2bfb0]/30 hover:border-[#a14000]/30'
                    }`}>
                    <Icon className="w-4 h-4" />
                    {off.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Event Filters */}
          <section>
            <h3 className="text-xs font-bold text-[#261812] mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#a14000]" />
              Event Types
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map(ev => {
                const Icon = ev.icon;
                const isActive = filters.events.includes(ev.id);
                return (
                  <button key={ev.id} onClick={() => toggleEvent(ev.id)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-[10px] font-semibold transition-all active:scale-95 ${
                      isActive ? 'bg-[#a14000] text-white border-[#a14000]' : 'bg-white text-[#5a4136] border-[#e2bfb0]/30 hover:border-[#a14000]/30'
                    }`}>
                    <Icon className="w-4 h-4" />
                    {ev.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-[#e2bfb0]/30 p-5 space-y-3">
          <button onClick={() => { onApply(filters); }}
            className="w-full py-3.5 bg-[#a14000] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            Apply Filters
            {selectedCount > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full">{selectedCount}</span>}
          </button>
          <div className="flex gap-3">
            <button onClick={handleReset}
              className="flex-1 py-3 border border-[#e2bfb0]/30 rounded-xl text-[10px] font-bold text-[#5a4136] hover:bg-[#fff1ec] transition-all flex items-center justify-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={handleSavePrefs}
              className="flex-1 py-3 border border-[#e2bfb0]/30 rounded-xl text-[10px] font-bold text-[#a14000] hover:bg-[#fff1ec] transition-all flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5" /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverFilterPanel;
