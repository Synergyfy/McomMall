'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Plus, 
  Copy, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Play, 
  Pause, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Percent, 
  Eye, 
  BarChart2, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/service/api';

type TabType = 'active' | 'scheduled' | 'borough' | 'featured' | 'drafts';

interface RotatorCampaign {
  id: string;
  title: string;
  rotatorType: string; // 'product' | 'promotion' | 'event' | 'borough' | 'featured'
  rotationSpeed: number;
  priority: string;
  visibility: string;
  boroughTarget?: string;
  storefrontTarget?: string;
  contentIds: string[];
  status: string; // 'active' | 'scheduled' | 'draft' | 'archived'
  created_at?: string;
}

export default function RotatorDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [campaigns, setCampaigns] = useState<RotatorCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load campaigns from API
  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await api.get('/rotators/my-rotators');
      const data = response.data || [];
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching rotator campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Default Mock Campaigns to display if none are fetched
  const mockCampaigns: RotatorCampaign[] = useMemo(() => [
    {
      id: 'mock-1',
      title: 'Spring Blossom Collection',
      rotatorType: 'product',
      rotationSpeed: 5,
      priority: 'high',
      visibility: 'public',
      boroughTarget: 'Southwark',
      storefrontTarget: 'Peckham High Street',
      contentIds: ['prod-1', 'prod-2'],
      status: 'active',
    },
    {
      id: 'mock-2',
      title: 'Neighborhood Favorites',
      rotatorType: 'borough',
      rotationSpeed: 8,
      priority: 'medium',
      visibility: 'public',
      boroughTarget: 'Lambeth',
      storefrontTarget: 'Brixton High Street',
      contentIds: ['promo-1', 'promo-2'],
      status: 'active',
    },
    {
      id: 'mock-3',
      title: 'Weekend Tasting Event Rotator',
      rotatorType: 'event',
      rotationSpeed: 6,
      priority: 'medium',
      visibility: 'public',
      boroughTarget: 'Camden',
      storefrontTarget: 'Camden High Street',
      contentIds: ['evt-1'],
      status: 'scheduled',
    }
  ], []);

  // Filtered campaigns list
  const filteredCampaigns = useMemo(() => {
    const list = campaigns.length > 0 ? campaigns : mockCampaigns;
    return list.filter(item => {
      // Tab Filtering
      let tabMatches = false;
      if (activeTab === 'active') tabMatches = item.status === 'active';
      else if (activeTab === 'scheduled') tabMatches = item.status === 'scheduled';
      else if (activeTab === 'borough') tabMatches = item.rotatorType === 'borough';
      else if (activeTab === 'featured') tabMatches = item.rotatorType === 'featured';
      else if (activeTab === 'drafts') tabMatches = item.status === 'draft';

      // Search Query Filtering
      const queryMatches = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (item.boroughTarget && item.boroughTarget.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           item.rotatorType.toLowerCase().includes(searchQuery.toLowerCase());

      return tabMatches && queryMatches;
    });
  }, [campaigns, mockCampaigns, activeTab, searchQuery]);

  // Deletion logic
  const handleDelete = async (id: string) => {
    if (id.startsWith('mock-')) {
      toast.success('Mock campaign removed successfully');
      return;
    }

    try {
      await api.delete(`/rotators/${id}`);
      toast.success('Rotator campaign deleted successfully');
      fetchCampaigns();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete campaign');
    }
  };

  // Duplication logic
  const handleDuplicate = async (id: string) => {
    if (id.startsWith('mock-')) {
      // Mock duplicate logic
      const target = mockCampaigns.find(c => c.id === id);
      if (target) {
        const copy: RotatorCampaign = {
          ...target,
          id: `mock-dup-${Date.now()}`,
          title: `${target.title} (Copy)`,
          status: 'draft',
        };
        setCampaigns(prev => [...prev, copy]);
        toast.success('Mock rotator duplicated successfully to Drafts!');
        setActiveTab('drafts');
      }
      return;
    }

    try {
      await api.post(`/rotators/${id}/duplicate`);
      toast.success('Rotator duplicated successfully');
      fetchCampaigns();
      setActiveTab('drafts'); // redirect to drafts since cloned are placed in drafts
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to duplicate rotator');
    }
  };

  // Pause / Resume toggles
  const handleToggleStatus = async (item: RotatorCampaign) => {
    if (item.id.startsWith('mock-')) {
      toast.info('Status toggling is only supported on live campaigns.');
      return;
    }

    const nextStatus = item.status === 'active' ? 'draft' : 'active';
    try {
      await api.patch(`/rotators/${item.id}`, { status: nextStatus });
      toast.success(`Rotator set to ${nextStatus}`);
      fetchCampaigns();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to change status');
    }
  };

  return (
    <div className="w-full min-h-full bg-[#f8f9ff] text-[#0b1c30] p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* --- Page Header & Actions --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-200/60">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            <span>Promotions</span>
            <span className="text-gray-300">/</span>
            <span className="text-orange-600">Rotators</span>
          </nav>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0b1c30]">
            Featured Rotators
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Manage your high-visibility community storefront and high-street feed rotations.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => toast.info('Select a campaign card below to duplicate.')}
            className="flex items-center gap-2 px-5 py-3 border border-orange-200 text-[#a14000] font-bold text-xs rounded-xl hover:bg-orange-50/50 transition-all active:scale-95 bg-white"
          >
            <Copy size={14} />
            Duplicate
          </button>
          <button 
            onClick={() => router.push('/dashboard/promotions/rotators/new')}
            className="flex items-center gap-2 px-5 py-3 bg-[#a14000] text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-700/10 hover:bg-[#a14000]/95 transition-all active:scale-95"
          >
            <Plus size={14} />
            Create Rotator
          </button>
        </div>
      </div>

      {/* --- Statistics Row (Asymmetric Bento Style) --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Reach Stats Bento Card */}
        <div className="md:col-span-8 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                <TrendingUp size={16} />
              </span>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Total Active Reach</span>
            </div>
            <div className="flex items-baseline gap-4 mt-2">
              <h3 className="text-4xl font-extrabold tracking-tight text-[#0b1c30]">42.8k</h3>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-lg">
                +12.4% vs last week
              </span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Impressions</span>
              <span className="font-extrabold text-base sm:text-lg text-slate-800 mt-1">128,402</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Click Rate</span>
              <span className="font-extrabold text-base sm:text-lg text-slate-800 mt-1">4.2%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Engagement</span>
              <span className="font-extrabold text-base sm:text-lg text-slate-800 mt-1">9,112</span>
            </div>
          </div>
        </div>

        {/* Insight Promotion Bento Card */}
        <div className="md:col-span-4 bg-gradient-to-br from-[#a14000] to-[#ff6900] rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-lg shadow-orange-700/10 group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
            <Zap size={20} className="fill-white" />
          </div>
          <div>
            <p className="text-base font-extrabold mb-1">Boost Neighborhood Visibility</p>
            <p className="text-xs text-white/80 leading-relaxed mb-6 font-medium">
              Schedule your next featured rotation to coincide with weekend local events.
            </p>
            <button 
              onClick={() => toast.info('Local Insights loading...')}
              className="w-full py-3 bg-white text-[#a14000] rounded-xl text-xs font-bold shadow-md hover:bg-orange-50 active:scale-95 transition-all"
            >
              View Local Insights
            </button>
          </div>
        </div>
      </div>

      {/* --- Tabs Navigation --- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-b border-slate-200/60 no-scrollbar">
        {([
          { id: 'active', label: 'Active Rotators' },
          { id: 'scheduled', label: 'Scheduled' },
          { id: 'borough', label: 'Borough Rotators' },
          { id: 'featured', label: 'Featured Rotators' },
          { id: 'drafts', label: 'Drafts' }
        ] as { id: TabType; label: string }[]).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors rounded-lg ${
                isActive 
                  ? 'bg-orange-50 text-orange-600 font-extrabold' 
                  : 'text-gray-500 hover:text-orange-600'
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.div 
                  layoutId="active-tab-line"
                  className="absolute bottom-0 left-0 right-0 height-[2px] bg-orange-600 rounded-t-full" 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* --- Filter Search & Headers --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h4 className="text-base font-bold text-slate-800 self-start">Campaigns Ledger</h4>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter rotators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff6900]/20 focus:border-[#ff6900]"
            />
          </div>
          <button 
            onClick={() => toast.info('Advanced filter drawer is coming soon')}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* --- Campaigns Grid --- */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 font-semibold">Loading campaigns...</div>
        ) : filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((item) => {
            const isMock = item.id.startsWith('mock-');
            return (
              <div 
                key={item.id}
                className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-orange-200 hover:shadow-md hover:shadow-orange-700/5 transition-all group"
              >
                {/* Left Section: Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 relative overflow-hidden border border-orange-100/50">
                    <span className="text-xs font-black uppercase tracking-wider">{item.rotatorType.slice(0, 3)}</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </h5>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        item.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : item.status === 'scheduled'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        {item.status === 'active' && <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
                        {item.status}
                      </span>
                      {item.boroughTarget && (
                        <span className="text-slate-400 text-xs font-semibold flex items-center gap-0.5">
                          <MapPin size={11} />
                          {item.boroughTarget}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle Section: Stats details */}
                <div className="flex items-center gap-6 sm:gap-12 flex-wrap">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Speed</span>
                    <span className="font-bold text-slate-700 text-xs sm:text-sm mt-0.5">{item.rotationSpeed}s interval</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Priority</span>
                    <span className="font-bold text-slate-700 text-xs sm:text-sm mt-0.5 uppercase">{item.priority}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Items Link</span>
                    <span className="font-bold text-slate-700 text-xs sm:text-sm mt-0.5">{item.contentIds?.length || 0} items</span>
                  </div>
                </div>

                {/* Right Section: Action Controls */}
                <div className="flex items-center gap-2 border-t border-slate-100 pt-3 md:pt-0 md:border-none">
                  <button 
                    onClick={() => handleToggleStatus(item)}
                    className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                    title={item.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                  >
                    {item.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button 
                    onClick={() => handleDuplicate(item.id)}
                    className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                    title="Clone Campaign"
                  >
                    <Copy size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Campaign"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-4 max-w-md mx-auto mt-6">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-black text-slate-800">Launch a new campaign</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Ready to reach more neighbors? Start a new rotator campaign to increase your storefront visibility.
              </p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/promotions/rotators/new')}
              className="mt-2 text-orange-600 font-extrabold text-xs hover:underline flex items-center gap-0.5"
            >
              Get Started Now
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
