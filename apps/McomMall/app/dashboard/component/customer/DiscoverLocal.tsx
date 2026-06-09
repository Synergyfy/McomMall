'use client';

import React, { useState, useCallback } from 'react';
import {
  ArrowLeft, Heart, Share2, QrCode, UserPlus, Star, Coffee, Calendar, Map,
  List, Compass, Search, ShoppingBag, Dumbbell, Lock, Zap, CheckCircle,
  Sparkles, X, Award, Info, ChefHat, ArrowRight, MapPin, TrendingUp,
  Building2, Store, Layers, Clock, Bell, ChevronDown, Sun, Bookmark,
  Utensils, Shirt, Palette, Monitor, Ticket, Gift, Filter, MapPinned,
  Smartphone, ChevronRight, Check, Users, MessageCircle, Link as LinkIcon,
} from 'lucide-react';
import { useCustomerPoints } from '@/context/CustomerPointsContext';
import { BUSINESS_MOCK_DATA, BusinessDetails } from '@/lib/mock-data/business-mock-data';
import { DiscoverBusinessProfile } from './DiscoverBusinessProfile';
import { DiscoverFilterPanel } from './DiscoverFilterPanel';

type DiscoverMainTab = 'nearby' | 'trending' | 'borough' | 'highstreet' | 'categories' | 'recommended' | 'recently-viewed';
type DiscoverView = 'home' | 'map' | 'details';

const BOROUGHS = [
  'Manhattan Central',
  'Brooklyn Heights',
  'Queens Boulevard',
  'Staten Island Central',
  'Bronx Plaza',
];

const MAIN_TABS: { id: DiscoverMainTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'nearby', label: 'Nearby', icon: MapPin },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'borough', label: 'Borough', icon: Building2 },
  { id: 'highstreet', label: 'High Street', icon: Store },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'recommended', label: 'Recommended', icon: Sparkles },
  { id: 'recently-viewed', label: 'Recently Viewed', icon: Clock },
];

const QUICK_FILTERS = [
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'fashion', label: 'Fashion', icon: Shirt },
  { id: 'beauty', label: 'Beauty', icon: Palette },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'electronics', label: 'Electronics', icon: Monitor },
  { id: 'events', label: 'Events', icon: Ticket },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'offers-near-me', label: 'Offers Near Me', icon: MapPinned },
];

const MOCK_TRENDING = [
  { id: 't1', name: 'Sakura Zen Dining', desc: 'Now offering seasonal lunch rewards', tag: '#1 Trending', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600', category: 'Dining', distance: '0.3 mi' },
  { id: 't2', name: 'Velocity Sports', desc: 'Join the Sneaker Hunt event this Friday!', tag: 'New Drop', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', category: 'Fashion', distance: '0.8 mi' },
  { id: 't3', name: 'Bloom Beauty Bar', desc: 'Weekend glow-up packages available', tag: 'Trending', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600', category: 'Beauty', distance: '0.5 mi' },
];

const MOCK_BOROUGH_CAMPAIGNS = [
  { id: 'bc1', title: 'Manhattan Summer Festival', desc: 'Live music, food trucks & rewards', spots: '120+', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=600' },
  { id: 'bc2', title: 'Brooklyn Art Walk', desc: 'Explore local galleries & earn points', spots: '45', image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=600' },
];

const MOCK_HIGH_STREET = [
  { id: 'hs1', name: 'Peckham High Street', desc: '12 active storefronts', deals: '8 live deals', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=600' },
  { id: 'hs2', name: 'Camden Town', desc: '9 active storefronts', deals: '5 live deals', image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=600' },
];

const CATEGORIES = [
  { id: 'food-drinks', label: 'Food & Drinks', icon: Utensils, color: 'bg-orange-100 text-orange-700' },
  { id: 'fashion', label: 'Fashion', icon: Shirt, color: 'bg-pink-100 text-pink-700' },
  { id: 'beauty', label: 'Beauty', icon: Palette, color: 'bg-rose-100 text-rose-700' },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'bg-emerald-100 text-emerald-700' },
  { id: 'electronics', label: 'Electronics', icon: Monitor, color: 'bg-blue-100 text-blue-700' },
  { id: 'entertainment', label: 'Entertainment', icon: Ticket, color: 'bg-purple-100 text-purple-700' },
  { id: 'services', label: 'Services', icon: Smartphone, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'family', label: 'Family Activities', icon: Users, color: 'bg-amber-100 text-amber-700' },
];

const RECENTLY_VIEWED = [
  { id: 'brew-co', name: 'Brew & Co.', category: 'Coffee', time: '10 min ago' },
  { id: 'iron-soul', name: 'Iron & Soul Gym', category: 'Fitness', time: '1 hour ago' },
  { id: 'urban-threads', name: 'Urban Threads', category: 'Streetwear', time: '3 hours ago' },
];

const MOCK_PROMOTIONS = [
  { id: 'p1', title: '30% Off Full Menu', business: 'The Urban Bistro', value: '30% OFF', expiry: '2 days left' },
  { id: 'p2', title: 'Buy 1 Get 1 Free', business: 'Morning Brew', value: 'BOGO', expiry: '5 hours left' },
  { id: 'p3', title: 'Free Smoothie', business: 'Iron & Soul Gym', value: 'FREE', expiry: '1 day left' },
];

const MOCK_EVENTS_FEED = [
  { id: 'ef1', title: 'Manhattan Street Food Expo', date: 'Fri, Jun 12', location: 'Central Court', attendees: 342 },
  { id: 'ef2', title: 'Sneaker Hunt Challenge', date: 'Sat, Jun 13', location: 'Level 2, North Wing', attendees: 189 },
];

const MOCK_REWARDS_NEARBY = [
  { id: 'rn1', title: 'Free Croissant', business: 'Brew & Co.', points: 250 },
  { id: 'rn2', title: 'Free Gym Session', business: 'Iron & Soul', points: 200 },
];

type ToastType = 'success' | 'error' | 'info';

export const DiscoverLocal: React.FC = () => {
  const { points, addPoints, redeemPoints } = useCustomerPoints();
  const [view, setView] = useState<DiscoverView>('home');
  const [previousView, setPreviousView] = useState<DiscoverView>('home');
  const [activeTab, setActiveTab] = useState<DiscoverMainTab>('nearby');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState('brew-co');
  const [selectedBorough, setSelectedBorough] = useState('Manhattan Central');
  const [isBoroughOpen, setIsBoroughOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [followedBusinesses, setFollowedBusinesses] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrScanSuccess, setQrScanSuccess] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMapPin, setActiveMapPin] = useState<'cafe' | 'event'>('cafe');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<Record<string, boolean>>({});
  const [redeemedOffers, setRedeemedOffers] = useState<Record<string, boolean>>({});
  const [showRedeemFlow, setShowRedeemFlow] = useState<string | null>(null);
  const [redeemStep, setRedeemStep] = useState(0);
  const [showEventFlow, setShowEventFlow] = useState<string | null>(null);
  const [eventFlowStep, setEventFlowStep] = useState(0);
  const [showRewardFlow, setShowRewardFlow] = useState<string | null>(null);
  const [rewardFlowStep, setRewardFlowStep] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSavedBusinesses, setShowSavedBusinesses] = useState(false);
  const [showFollowedBusinesses, setShowFollowedBusinesses] = useState(false);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
    showToast(favorites[id] ? 'Removed from saved!' : 'Saved!', 'info');
  };

  const navigateToDetails = (id: string) => {
    setSelectedBusinessId(id);
    setPreviousView(view);
    setView('details');
  };

  const handleBack = () => setView(previousView);

  const handleToggleFollow = (id: string) => {
    setFollowedBusinesses(prev => {
      const newVal = !prev[id];
      showToast(newVal ? `Following!` : `Unfollowed`, 'info');
      return { ...prev, [id]: newVal };
    });
  };

  const handleRedeemPromotion = (id: string, title: string) => {
    setShowRedeemFlow(id);
    setRedeemStep(0);
  };

  const handleRegisterEvent = (eventId: string, title: string) => {
    setShowEventFlow(eventId);
    setEventFlowStep(0);
  };

  const handleCollectReward = (businessId: string, title: string, cost: number) => {
    if (points < cost) { showToast(`Need ${cost} pts`, 'error'); return; }
    setShowRewardFlow(businessId);
    setRewardFlowStep(0);
  };

  const handleQRScan = () => {
    setQrScanSuccess(true);
    setTimeout(() => {
      setIsQRModalOpen(false);
      setQrScanSuccess(false);
      addPoints(50);
      showToast('QR Scanned! +50 Points', 'success');
    }, 2000);
  };

  const ToastIcon = toast?.type === 'success' ? CheckCircle : toast?.type === 'error' ? X : Info;

  const currentBusinessList = Object.values(BUSINESS_MOCK_DATA).filter(biz => {
    const q = searchQuery.toLowerCase();
    return !q || biz.name.toLowerCase().includes(q) || biz.category.toLowerCase().includes(q);
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'nearby': return <NearbyTabContent
        businesses={currentBusinessList}
        favorites={favorites}
        hoveredCard={hoveredCard}
        onHover={setHoveredCard}
        onNavigate={navigateToDetails}
        onToggleFav={toggleFavorite}
        points={points}
        promotions={MOCK_PROMOTIONS}
        events={MOCK_EVENTS_FEED}
        rewards={MOCK_REWARDS_NEARBY}
        onRedeem={handleRedeemPromotion}
        onJoinEvent={handleRegisterEvent}
      />;
      case 'trending': return <TrendingTabContent items={MOCK_TRENDING} onNavigate={navigateToDetails} />;
      case 'borough': return <BoroughTabContent
        campaigns={MOCK_BOROUGH_CAMPAIGNS}
        borough={selectedBorough}
        businesses={currentBusinessList}
        onNavigate={navigateToDetails}
        showToast={showToast}
      />;
      case 'highstreet': return <HighStreetTabContent streets={MOCK_HIGH_STREET} showToast={showToast} />;
      case 'categories': return <CategoriesTabContent categories={CATEGORIES} onNavigate={(c) => { showToast(`Browsing ${c}`, 'info'); }} />;
      case 'recommended': return <RecommendedTabContent businesses={currentBusinessList} onNavigate={navigateToDetails} points={points} />;
      case 'recently-viewed': return <RecentlyViewedTabContent items={RECENTLY_VIEWED} onNavigate={navigateToDetails} />;
    }
  };

  const recentSearches = ['Coffee', 'Pizza', 'Gym'];
  const trendingSearches = ['Flash Deals', 'Weekend Promos', 'Rewards'];

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#261812] font-sans antialiased relative pb-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold backdrop-blur-md ${
            toast.type === 'success' ? 'bg-emerald-50/95 text-emerald-700 border-emerald-200' :
            toast.type === 'error' ? 'bg-red-50/95 text-red-700 border-red-200' :
            'bg-white/95 text-stone-700 border-stone-200'
          }`}>
            <ToastIcon className={`w-4 h-4 ${toast.type === 'success' ? 'text-emerald-500' : toast.type === 'error' ? 'text-red-500' : 'text-stone-500'}`} />
            {toast.message}
          </div>
        </div>
      )}

      {/* ===== HOME VIEW ===== */}
      {view === 'home' && (
        <div className="animate-in fade-in duration-300">
          {/* Header */}
          <header className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ff6900]/10 flex items-center justify-center text-[#a14000]">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="relative">
                <button onClick={() => setIsBoroughOpen(!isBoroughOpen)} className="flex items-center gap-1 font-bold text-sm text-[#261812]">
                  {selectedBorough}
                  <ChevronDown className="w-4 h-4 text-[#5a4136]" />
                </button>
                <p className="text-[10px] text-[#5a4136] font-semibold flex items-center gap-1">
                  <Sun className="w-3 h-3" /> Sunny · 72°F · High Activity
                </p>
                {isBoroughOpen && (
                  <div className="absolute top-8 left-0 z-50 bg-white border border-[#e2bfb0] shadow-lg rounded-xl py-2 w-56 animate-in fade-in slide-in-from-top-2 duration-150">
                    {BOROUGHS.map(b => (
                      <button key={b} onClick={() => { setSelectedBorough(b); setIsBoroughOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#fff1ec] transition-colors ${selectedBorough === b ? 'text-[#a14000] bg-[#fff1ec]' : 'text-[#5a4136]'}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#ff9969] px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-[14px] h-[14px] fill-[#773005] text-[#773005]" />
                <span className="text-xs font-extrabold text-[#773005]">{points.toLocaleString()} pts</span>
              </div>
              <button className="p-2 hover:bg-[#f8ddd2] rounded-full transition-colors relative">
                <Bell className="w-5 h-5 text-[#5a4136]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </header>

          {/* Search Bar */}
          <section className="mb-5 relative">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e7164] group-focus-within:text-[#a14000] transition-colors" />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchSuggestions(e.target.value.length > 0); }}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-[#e2bfb0]/40 bg-white focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000] transition-all outline-none text-sm text-[#261812] placeholder:text-[#8e7164]"
                placeholder="Search stores, rewards, events..."
                type="text"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e7164] hover:text-[#5a4136]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Search Suggestions */}
            {showSearchSuggestions && !searchQuery && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-[#e2bfb0]/30 shadow-lg p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                <div>
                  <p className="text-[10px] font-bold text-[#5a4136] uppercase tracking-wider mb-2">Recent Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(s => (
                      <button key={s} onClick={() => setSearchQuery(s)} className="px-3 py-1.5 bg-[#f8ddd2] rounded-full text-xs font-semibold text-[#5a4136]">{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#5a4136] uppercase tracking-wider mb-2">Trending</p>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map(s => (
                      <button key={s} onClick={() => setSearchQuery(s)} className="px-3 py-1.5 bg-[#ff9969]/20 rounded-full text-xs font-semibold text-[#a14000]">{s}</button>
                    ))}
                  </div>
                </div>
                <button className="w-full py-2 text-[10px] font-bold text-[#a14000] border-t border-[#e2bfb0]/30 pt-3">Voice Search</button>
              </div>
            )}
            {/* Search Results */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-[#e2bfb0]/30 shadow-lg max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                {currentBusinessList.length === 0 ? (
                  <div className="p-8 text-center">
                    <Search className="w-8 h-8 text-[#8e7164] mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#5a4136]">No Results</p>
                    <p className="text-[10px] text-[#8e7164] mt-1">Try adjusting your search</p>
                  </div>
                ) : (
                  currentBusinessList.map(biz => (
                    <button key={biz.id} onClick={() => { setSearchQuery(''); setShowSearchSuggestions(false); navigateToDetails(biz.id); }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-[#fff1ec] transition-colors border-b border-[#e2bfb0]/10 last:border-0">
                      <div className="w-12 h-12 rounded-xl bg-[#f8ddd2] overflow-hidden shrink-0">
                        <img className="w-full h-full object-cover" alt={biz.name} src={biz.heroImage} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#261812]">{biz.name}</p>
                        <p className="text-[10px] text-[#5a4136]">{biz.category} · {biz.distance}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold shrink-0">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {biz.rating}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </section>

          {/* Main Tabs */}
          <section className="mb-5 -mx-5 overflow-x-auto no-scrollbar px-5">
            <div className="flex gap-2 pb-2">
              {MAIN_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                      isActive ? 'bg-[#a14000] text-white shadow-sm' : 'bg-[#ffeae1] text-[#5a4136] hover:bg-[#f8ddd2]'
                    }`}>
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Quick Filters */}
          <section className="mb-5 -mx-5 overflow-x-auto no-scrollbar px-5">
            <div className="flex gap-2 pb-2">
              {QUICK_FILTERS.map(f => {
                const Icon = f.icon;
                const isActive = activeQuickFilter === f.id;
                return (
                  <button key={f.id} onClick={() => setActiveQuickFilter(isActive ? null : f.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-semibold transition-all active:scale-95 border ${
                      isActive ? 'bg-[#a14000] text-white border-[#a14000]' : 'bg-white text-[#5a4136] border-[#e2bfb0]/30 hover:border-[#a14000]/30'
                    }`}>
                    <Icon className="w-3.5 h-3.5" />
                    {f.label}
                  </button>
                );
              })}
              <button onClick={() => setIsFilterOpen(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-semibold bg-[#5a4136] text-white transition-all active:scale-95">
                <Filter className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
          </section>

          {/* Tab Content */}
          <section className="mb-20">
            {renderTabContent()}
          </section>

          {/* Floating Action Buttons */}
          <div className="fixed bottom-24 right-5 z-40 flex flex-col gap-3">
            <button onClick={() => { setPreviousView(view); setView('map'); }}
              className="w-12 h-12 bg-white border border-[#e2bfb0]/30 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all text-[#5a4136]">
              <Map className="w-5 h-5" />
            </button>
            <button onClick={() => setShowSavedBusinesses(true)}
              className="w-12 h-12 bg-white border border-[#e2bfb0]/30 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all text-[#5a4136]">
              <Bookmark className="w-5 h-5" />
            </button>
            <button onClick={() => setIsQRModalOpen(true)}
              className="w-14 h-14 bg-[#a14000] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all">
              <QrCode className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* ===== MAP VIEW ===== */}
      {view === 'map' && (
        <div className="animate-in fade-in duration-300 relative h-[75vh] rounded-2xl overflow-hidden border border-[#e2bfb0]/30 shadow-sm bg-stone-50">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover opacity-40 select-none" alt="Map" src="https://images.unsplash.com/photo-1569336415962-a4bd9f18cdcd?auto=format&fit=crop&q=80&w=1200" />
            <div onClick={() => setActiveMapPin('cafe')} className="absolute top-[44%] left-[38%] z-20 cursor-pointer">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-all duration-200 ${
                  activeMapPin === 'cafe' ? 'bg-orange-200 text-orange-900 scale-110 ring-4 ring-orange-200/40' : 'bg-white text-stone-400'
                }`}>
                  <Coffee className={`w-5 h-5 ${activeMapPin === 'cafe' ? 'fill-orange-900' : ''}`} />
                </div>
                <div className="mt-1.5 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-md">
                  <p className="text-[10px] font-bold text-stone-900">Brew & Co. · 2x Points</p>
                </div>
              </div>
            </div>
            <div onClick={() => setActiveMapPin('event')} className="absolute top-[30%] left-[62%] z-20 cursor-pointer">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-all duration-200 ${
                  activeMapPin === 'event' ? 'bg-blue-500 text-white scale-110 ring-4 ring-blue-500/30' : 'bg-white text-stone-400'
                }`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="mt-1.5 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-md">
                  <p className="text-[10px] font-bold text-stone-900">Summer Festival</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e7164]" />
              <input className="w-full pl-10 pr-4 py-3 bg-white/95 backdrop-blur-md border border-[#e2bfb0]/30 rounded-xl shadow-md text-sm outline-none" placeholder="Search this area..." type="text" readOnly />
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#e2bfb0]/30 shadow-xl max-w-md mx-auto">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ff9969]/20 text-[#a14000] rounded-full font-bold text-[9px] uppercase tracking-wider w-fit mb-3">
                <Compass className="w-3.5 h-3.5" />
                Featured Nearby
              </div>
              {activeMapPin === 'cafe' ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#a14000] mb-0.5">Coffee Shop</p>
                    <h4 className="text-sm font-bold text-stone-900">The Artisan Grind</h4>
                    <p className="text-stone-500 text-xs line-clamp-1">Cozy loft vibe with 2x points on all pour-overs.</p>
                  </div>
                  <button onClick={() => navigateToDetails('brew-co')} className="bg-[#a14000] text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all shrink-0">View</button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600 mb-0.5">Event</p>
                    <h4 className="text-sm font-bold text-stone-900">Central Plaza Festival</h4>
                    <p className="text-stone-500 text-xs line-clamp-1">Live music, food trucks, and rewards.</p>
                  </div>
                  <button onClick={() => navigateToDetails('urban-threads')} className="bg-[#a14000] text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all shrink-0">View</button>
                </div>
              )}
            </div>
          </div>

          <button onClick={() => setView('home')}
            className="fixed bottom-24 right-5 z-40 flex items-center gap-2 bg-[#a14000] text-white px-5 py-3.5 rounded-full shadow-lg active:scale-95 transition-all">
            <List className="w-4 h-4" />
            <span className="text-xs font-bold">List View</span>
          </button>
        </div>
      )}

      {/* ===== DETAILS VIEW ===== */}
      {view === 'details' && (
        <DiscoverBusinessProfile
          businessId={selectedBusinessId}
          points={points}
          favorites={favorites}
          followedBusinesses={followedBusinesses}
          redeemedOffers={redeemedOffers}
          registeredEvents={registeredEvents}
          onBack={handleBack}
          onToggleFav={toggleFavorite}
          onToggleFollow={handleToggleFollow}
          onRedeem={handleRedeemPromotion}
          onJoinEvent={handleRegisterEvent}
          onCollectReward={handleCollectReward}
          showToast={showToast}
        />
      )}

      {/* QR Modal */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-6 text-center">
            <div className="flex justify-between items-center border-b border-[#e2bfb0]/30 pb-3">
              <span className="text-sm font-bold text-[#261812]">Scan QR Code</span>
              <button onClick={() => { setIsQRModalOpen(false); setQrScanSuccess(false); }} className="p-1 text-[#8e7164] hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-square w-full max-w-[200px] mx-auto border-4 border-dashed border-[#a14000] rounded-2xl flex items-center justify-center bg-[#fff1ec] overflow-hidden">
              {qrScanSuccess ? (
                <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <QrCode className="w-16 h-16 text-[#a14000] opacity-60" />
                  <span className="text-[10px] text-[#8e7164] font-bold uppercase animate-pulse">Scanning...</span>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#261812] mb-1">Position QR inside frame</h4>
              <p className="text-xs text-[#5a4136]">Scan at counters to earn instant rewards & unlock offers.</p>
            </div>
            {!qrScanSuccess && (
              <button onClick={handleQRScan} className="w-full bg-[#a14000] text-white text-sm font-bold py-3 rounded-xl shadow-md active:scale-95 transition-all">
                Simulate Scan
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {isFilterOpen && (
        <DiscoverFilterPanel
          onClose={() => setIsFilterOpen(false)}
          onApply={(filters) => { showToast('Filters applied!', 'success'); setIsFilterOpen(false); }}
          showToast={showToast}
        />
      )}

      {/* Offer Redemption Flow */}
      {showRedeemFlow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { if (redeemStep >= 3) { setShowRedeemFlow(null); setRedeemStep(0); } }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 space-y-5" onClick={e => e.stopPropagation()}>
            {redeemStep === 0 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-[#ff9969]/20 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-[#a14000]" />
                </div>
                <h3 className="font-extrabold text-[#261812]">Select Offer</h3>
                <p className="text-xs text-[#5a4136]">Review the offer details before redeeming</p>
                <div className="bg-[#fff1ec] rounded-2xl p-4 text-left">
                  <p className="text-sm font-bold text-[#261812]">{BUSINESS_MOCK_DATA[showRedeemFlow]?.flashSaleTitle}</p>
                  <p className="text-[10px] text-[#5a4136] mt-1">{BUSINESS_MOCK_DATA[showRedeemFlow]?.flashSaleDesc}</p>
                </div>
                <button onClick={() => setRedeemStep(1)} className="w-full py-3 bg-[#a14000] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md">Continue</button>
                <button onClick={() => { setShowRedeemFlow(null); setRedeemStep(0); }} className="w-full py-2 text-[10px] font-bold text-[#5a4136]">Cancel</button>
              </div>
            )}
            {redeemStep === 1 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                  <Info className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-extrabold text-[#261812]">Terms & Conditions</h3>
                <p className="text-xs text-[#5a4136] text-left leading-relaxed bg-[#f8ddd2] p-4 rounded-2xl">
                  This offer is valid until the stated expiry date. Cannot be combined with other offers. One per customer. Valid in-store only. Present this confirmation at checkout.
                </p>
                <button onClick={() => setRedeemStep(2)} className="w-full py-3 bg-[#a14000] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md">Accept & Continue</button>
                <button onClick={() => setRedeemStep(0)} className="w-full py-2 text-[10px] font-bold text-[#5a4136]">Back</button>
              </div>
            )}
            {redeemStep === 2 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-extrabold text-[#261812]">Redeem at Store</h3>
                <p className="text-xs text-[#5a4136]">Show this QR code at the counter to redeem your offer</p>
                <div className="w-40 h-40 mx-auto bg-white border-2 border-[#a14000] rounded-2xl flex items-center justify-center p-4">
                  <div className="w-full h-full bg-[#261812] relative overflow-hidden">
                    <div className="absolute inset-2 border-2 border-white/30" />
                    <div className="absolute inset-4 bg-white/10" />
                    <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-white" />
                  </div>
                </div>
                <p className="text-[9px] text-[#8e7164] font-medium">Code: {showRedeemFlow?.substring(0, 3).toUpperCase()}{Math.floor(1000 + Math.random() * 9000)}</p>
                <button onClick={() => { setRedeemStep(3); handleRedeemPromotion(showRedeemFlow, ''); }} className="w-full py-3 bg-[#a14000] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md">I've Showed This at Store</button>
                <button onClick={() => setRedeemStep(1)} className="w-full py-2 text-[10px] font-bold text-[#5a4136]">Back</button>
              </div>
            )}
            {redeemStep === 3 && (
              <div className="text-center space-y-5 py-4">
                <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="font-extrabold text-[#261812] text-base">Offer Redeemed!</h3>
                <p className="text-xs text-[#5a4136]">Your offer has been activated. You earned <strong className="text-[#a14000]">+100 Points</strong>!</p>
                <button onClick={() => { setShowRedeemFlow(null); setRedeemStep(0); setRedeemedOffers(prev => ({ ...prev, [showRedeemFlow]: true })); addPoints(100); }}
                  className="w-full py-3 bg-[#a14000] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Join Flow */}
      {showEventFlow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { if (eventFlowStep >= 3) { setShowEventFlow(null); setEventFlowStep(0); } }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 space-y-5" onClick={e => e.stopPropagation()}>
            {eventFlowStep === 0 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-extrabold text-[#261812]">Event Details</h3>
                <div className="bg-[#fff1ec] rounded-2xl p-4 text-left space-y-2">
                  <p className="text-sm font-bold text-[#261812]">Borough Event</p>
                  <p className="text-[10px] text-[#5a4136]">Join this event to connect with your local community and earn rewards.</p>
                </div>
                <button onClick={() => setEventFlowStep(1)} className="w-full py-3 bg-[#a14000] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md">Continue to Join</button>
                <button onClick={() => { setShowEventFlow(null); setEventFlowStep(0); }} className="w-full py-2 text-[10px] font-bold text-[#5a4136]">Cancel</button>
              </div>
            )}
            {eventFlowStep === 1 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-[#ff9969]/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-[#a14000]" />
                </div>
                <h3 className="font-extrabold text-[#261812]">Confirm Attendance</h3>
                <p className="text-xs text-[#5a4136]">You're about to register for this event. Spots are limited!</p>
                <div className="bg-amber-50 rounded-2xl p-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-[10px] font-semibold text-amber-700">Reward: +50 pts for attending</span>
                </div>
                <button onClick={() => setEventFlowStep(2)} className="w-full py-3 bg-[#a14000] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md">Confirm Join</button>
                <button onClick={() => setEventFlowStep(0)} className="w-full py-2 text-[10px] font-bold text-[#5a4136]">Back</button>
              </div>
            )}
            {eventFlowStep === 2 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="font-extrabold text-[#261812] text-base">You're In!</h3>
                <p className="text-xs text-[#5a4136]">You've successfully registered. We'll send you a reminder before the event.</p>
                <div className="bg-[#f8ddd2] rounded-2xl p-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#a14000]" />
                  <span className="text-[10px] font-semibold text-[#5a4136]">Added to your calendar</span>
                </div>
                <button onClick={() => { setShowEventFlow(null); setEventFlowStep(0); }} className="w-full py-3 bg-[#a14000] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reward Collection Flow */}
      {showRewardFlow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { if (rewardFlowStep >= 3) { setShowRewardFlow(null); setRewardFlowStep(0); } }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 space-y-5" onClick={e => e.stopPropagation()}>
            {rewardFlowStep === 0 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-extrabold text-[#261812]">Collect Reward</h3>
                <p className="text-xs text-[#5a4136]">Review the reward conditions before collecting</p>
                <div className="bg-[#fff1ec] rounded-2xl p-4">
                  <p className="text-sm font-bold text-[#261812]">Tier Reward</p>
                  <p className="text-[10px] text-[#5a4136] mt-1">You've earned enough points to unlock this reward!</p>
                </div>
                <button onClick={() => setRewardFlowStep(1)} className="w-full py-3 bg-[#a14000] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md">Continue</button>
                <button onClick={() => { setShowRewardFlow(null); setRewardFlowStep(0); }} className="w-full py-2 text-[10px] font-bold text-[#5a4136]">Cancel</button>
              </div>
            )}
            {rewardFlowStep === 1 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-extrabold text-[#261812]">Conditions Met</h3>
                <p className="text-xs text-[#5a4136]">You meet all requirements to collect this reward</p>
                <button onClick={() => setRewardFlowStep(2)} className="w-full py-3 bg-[#a14000] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md">Collect Now</button>
                <button onClick={() => setRewardFlowStep(0)} className="w-full py-2 text-[10px] font-bold text-[#5a4136]">Back</button>
              </div>
            )}
            {rewardFlowStep === 2 && (
              <div className="text-center space-y-5 py-4">
                <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                  <Award className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="font-extrabold text-[#261812] text-base">Reward Collected!</h3>
                <p className="text-xs text-[#5a4136]">Your reward has been added to your account. Check your rewards tab to use it.</p>
                <button onClick={() => { setShowRewardFlow(null); setRewardFlowStep(0); }}
                  className="w-full py-3 bg-[#a14000] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Business Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-[#261812] flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#a14000]" />
                Share Business
              </h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 text-[#8e7164] hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#5a4136]">Share this business with friends and family</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: MessageCircle, label: 'WhatsApp', color: 'text-green-500 bg-green-50', key: 'wa' },
                { icon: Smartphone, label: 'SMS', color: 'text-blue-500 bg-blue-50', key: 'sms' },
                { icon: MessageCircle, label: 'Messenger', color: 'text-indigo-500 bg-indigo-50', key: 'msgr' },
                { icon: LinkIcon, label: 'Copy Link', color: 'text-[#a14000] bg-[#ffeae1]', key: 'link' },
              ].map(ch => (
                <button key={ch.key} onClick={() => { setShowShareModal(false); showToast('Link shared!', 'success'); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#e2bfb0]/30 hover:shadow-sm transition-all active:scale-95 ${ch.color}`}>
                  <ch.icon className="w-6 h-6" />
                  <span className="text-[10px] font-bold">{ch.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Saved Businesses Modal */}
      {showSavedBusinesses && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowSavedBusinesses(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[70vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-[#e2bfb0]/30">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#a14000]" />
                <h2 className="text-base font-extrabold text-[#261812]">Saved Businesses</h2>
              </div>
              <button onClick={() => setShowSavedBusinesses(false)} className="p-1 text-[#8e7164] hover:text-[#a14000] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {Object.keys(favorites).filter(k => favorites[k]).length === 0 ? (
                <div className="py-12 text-center">
                  <Bookmark className="w-10 h-10 text-[#8e7164] mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-[#261812]">No Saved Businesses</h3>
                  <p className="text-xs text-[#5a4136] mt-1">Tap the heart icon on any business to save it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(favorites).filter(([, v]) => v).map(([id]) => {
                    const biz = BUSINESS_MOCK_DATA[id];
                    if (!biz) return null;
                    return (
                      <div key={id} onClick={() => { setShowSavedBusinesses(false); navigateToDetails(id); }}
                        className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-[#e2bfb0]/30 cursor-pointer hover:bg-[#fff1ec] transition-all active:scale-[0.98]">
                        <div className="w-14 h-14 rounded-xl bg-[#f8ddd2] overflow-hidden shrink-0">
                          <img className="w-full h-full object-cover" alt={biz.name} src={biz.heroImage} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#261812]">{biz.name}</p>
                          <p className="text-[10px] text-[#5a4136]">{biz.category} · {biz.distance}</p>
                        </div>
                        <Heart className="w-4 h-4 fill-red-500 text-red-500 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Followed Businesses Modal */}
      {showFollowedBusinesses && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowFollowedBusinesses(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[70vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-[#e2bfb0]/30">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#a14000]" />
                <h2 className="text-base font-extrabold text-[#261812]">Followed Businesses</h2>
              </div>
              <button onClick={() => setShowFollowedBusinesses(false)} className="p-1 text-[#8e7164] hover:text-[#a14000] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {Object.keys(followedBusinesses).filter(k => followedBusinesses[k]).length === 0 ? (
                <div className="py-12 text-center">
                  <UserPlus className="w-10 h-10 text-[#8e7164] mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-[#261812]">No Followed Businesses</h3>
                  <p className="text-xs text-[#5a4136] mt-1">Follow businesses to get updates on their latest offers</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(followedBusinesses).filter(([, v]) => v).map(([id]) => {
                    const biz = BUSINESS_MOCK_DATA[id];
                    if (!biz) return null;
                    return (
                      <div key={id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-[#e2bfb0]/30">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setShowFollowedBusinesses(false); navigateToDetails(id); }}>
                          <div className="w-14 h-14 rounded-xl bg-[#f8ddd2] overflow-hidden shrink-0">
                            <img className="w-full h-full object-cover" alt={biz.name} src={biz.heroImage} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#261812]">{biz.name}</p>
                            <p className="text-[10px] text-[#5a4136]">{biz.category} · {biz.distance}</p>
                            <span className="text-[8px] text-emerald-600 font-bold">Active now</span>
                          </div>
                        </div>
                        <button onClick={() => { handleToggleFollow(id); }}
                          className="px-3 py-1.5 border border-[#e2bfb0]/30 rounded-xl text-[10px] font-bold text-[#5a4136] hover:bg-[#fff1ec] transition-all active:scale-95">
                          Unfollow
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== TAB CONTENT COMPONENTS ===== */

function NearbyTabContent({ businesses, favorites, hoveredCard, onHover, onNavigate, onToggleFav, points, promotions, events, rewards, onRedeem, onJoinEvent }: {
  businesses: BusinessDetails[]; favorites: Record<string, boolean>; hoveredCard: string | null; onHover: (id: string | null) => void;
  onNavigate: (id: string) => void; onToggleFav: (id: string, e?: React.MouseEvent) => void; points: number;
  promotions: typeof MOCK_PROMOTIONS; events: typeof MOCK_EVENTS_FEED; rewards: typeof MOCK_REWARDS_NEARBY;
  onRedeem: (id: string, title: string) => void; onJoinEvent: (id: string, title: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Live Offers Banner */}
      <div className="bg-[#a14000] text-white p-5 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Live Near You</span>
          <h3 className="text-lg font-extrabold mt-1">{promotions.length} Active Offers Nearby</h3>
          <p className="text-xs text-orange-100 mt-1">Rewards, flash deals & more within 1km</p>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-10">
          <MapPin className="w-24 h-24" />
        </div>
      </div>
      {/* Promotions Strip */}
      <div className="-mx-5 overflow-x-auto no-scrollbar px-5">
        <div className="flex gap-3 pb-2">
          {promotions.map(p => (
            <button key={p.id} onClick={() => onRedeem(p.id, p.title)}
              className="flex-shrink-0 w-48 bg-white rounded-2xl p-4 border border-[#e2bfb0]/30 shadow-sm text-left hover:shadow-md transition-all active:scale-95">
              <span className="text-[9px] font-bold text-[#a14000] bg-[#ff9969]/20 px-2 py-0.5 rounded-full">{p.value}</span>
              <p className="text-sm font-bold text-[#261812] mt-2">{p.title}</p>
              <p className="text-[10px] text-[#5a4136] mt-0.5">{p.business}</p>
              <p className="text-[9px] text-red-500 font-semibold mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {p.expiry}
              </p>
            </button>
          ))}
        </div>
      </div>
      {/* Nearby Stores */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#261812]">Nearby Stores</h3>
          <span className="text-[10px] font-bold text-[#a14000]">{businesses.length} found</span>
        </div>
        {businesses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#e2bfb0]/30">
            <MapPin className="w-8 h-8 text-[#8e7164] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#5a4136]">No Nearby Businesses</p>
            <p className="text-[10px] text-[#8e7164] mt-1">Try expanding your search area</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {businesses.map(biz => (
              <div key={biz.id} onClick={() => onNavigate(biz.id)}
                onMouseEnter={() => onHover(biz.id)} onMouseLeave={() => onHover(null)}
                className="bg-white rounded-2xl overflow-hidden border border-[#e2bfb0]/30 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#f8ddd2]">
                    <img className={`w-full h-full object-cover transition-transform duration-300 ${hoveredCard === biz.id ? 'scale-110' : ''}`} alt={biz.name} src={biz.heroImage} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-[#261812]">{biz.name}</p>
                        <p className="text-[10px] text-[#5a4136]">{biz.category} · {biz.distance}</p>
                      </div>
                      <button onClick={(e) => onToggleFav(biz.id, e)} className="shrink-0">
                        <Heart className={`w-4 h-4 ${favorites[biz.id] ? 'fill-red-500 text-red-500' : 'text-[#8e7164]'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {biz.rating}
                      </div>
                      <span className="text-[9px] text-[#5a4136]">{biz.reviewCount}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${biz.statusTag === 'OPEN NOW' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {biz.statusTag}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[9px] font-bold text-[#a14000] bg-[#ff9969]/20 px-2 py-0.5 rounded-full">Reward available</span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Nearby Events */}
      {events.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#261812] mb-3">Live Nearby Events</h3>
          <div className="space-y-3">
            {events.map(e => (
              <div key={e.id} className="bg-white rounded-2xl p-4 border border-[#e2bfb0]/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#ff9969]/20 flex items-center justify-center text-[#a14000]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#261812]">{e.title}</p>
                    <p className="text-[9px] text-[#5a4136]">{e.date} · {e.location}</p>
                    <p className="text-[9px] text-[#8e7164]">{e.attendees} attending</p>
                  </div>
                </div>
                <button onClick={() => onJoinEvent(e.id, e.title)} className="px-4 py-2 bg-[#a14000] text-white rounded-xl text-[10px] font-bold active:scale-95 transition-all">Join</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Reward Opportunities */}
      {rewards.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#261812] mb-3">Reward Opportunities</h3>
          <div className="grid grid-cols-2 gap-3">
            {rewards.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-4 border border-[#e2bfb0]/30 text-center">
                <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#261812]">{r.title}</p>
                <p className="text-[9px] text-[#5a4136]">{r.business}</p>
                <p className="text-[9px] font-bold text-[#a14000] mt-2">{r.points} pts</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TrendingTabContent({ items, onNavigate }: { items: typeof MOCK_TRENDING; onNavigate: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#a14000] to-[#ff6900] text-white p-5 rounded-2xl">
        <TrendingUp className="w-6 h-6 mb-2" />
        <h3 className="text-lg font-extrabold">Trending in Your Borough</h3>
        <p className="text-xs text-orange-100 mt-1">Popular businesses and promotions right now</p>
      </div>
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-[#e2bfb0]/30">
          <TrendingUp className="w-8 h-8 text-[#8e7164] mx-auto mb-2" />
          <p className="text-xs font-bold text-[#5a4136]">No Trending Activity</p>
          <p className="text-[10px] text-[#8e7164] mt-1">Check back soon for trending businesses</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.id} onClick={() => onNavigate(item.id)}
              className="bg-white rounded-2xl p-4 border border-[#e2bfb0]/30 flex items-center gap-4 hover:bg-[#fff1ec] transition-all cursor-pointer active:scale-[0.98]">
              <div className="w-12 h-12 rounded-xl bg-[#f8ddd2] overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" alt={item.name} src={item.image} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#261812]">{item.name}</p>
                  <span className="text-[9px] font-bold text-[#a14000] bg-[#ff9969]/20 px-2 py-0.5 rounded-full">{item.tag}</span>
                </div>
                <p className="text-[10px] text-[#5a4136] mt-0.5">{item.desc}</p>
                <p className="text-[9px] text-[#8e7164] mt-1">{item.category} · {item.distance}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8e7164] shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BoroughTabContent({ campaigns, borough, businesses, onNavigate, showToast }: {
  campaigns: typeof MOCK_BOROUGH_CAMPAIGNS; borough: string; businesses: BusinessDetails[];
  onNavigate: (id: string) => void; showToast: (msg: string, type: ToastType) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-[#fff1ec] p-5 rounded-2xl border border-[#e2bfb0]/30">
        <Building2 className="w-6 h-6 text-[#a14000] mb-2" />
        <h3 className="text-lg font-extrabold text-[#261812]">{borough}</h3>
        <p className="text-xs text-[#5a4136] mt-1">Discover local businesses, campaigns & events in your borough</p>
      </div>
      {/* Borough Campaigns */}
      <div>
        <h3 className="text-sm font-bold text-[#261812] mb-3">Active Borough Campaigns</h3>
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#e2bfb0]/30">
            <Building2 className="w-8 h-8 text-[#8e7164] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#5a4136]">No Campaigns</p>
            <p className="text-[10px] text-[#8e7164] mt-1">Check back for borough campaigns</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="bg-white rounded-2xl overflow-hidden border border-[#e2bfb0]/30 shadow-sm">
                <div className="h-32 relative">
                  <img className="w-full h-full object-cover" alt={c.title} src={c.image} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h4 className="text-white font-bold text-sm">{c.title}</h4>
                    <p className="text-white/80 text-[10px]">{c.desc}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-[10px] text-[#5a4136] font-semibold">{c.spots} spots</span>
                  <button onClick={() => showToast('Joined campaign!', 'success')} className="px-4 py-2 bg-[#a14000] text-white rounded-xl text-[10px] font-bold active:scale-95 transition-all">Join Campaign</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Borough Businesses */}
      <div>
        <h3 className="text-sm font-bold text-[#261812] mb-3">Borough Businesses</h3>
        <div className="grid grid-cols-1 gap-3">
          {businesses.slice(0, 4).map(biz => (
            <div key={biz.id} onClick={() => onNavigate(biz.id)}
              className="bg-white rounded-2xl p-4 border border-[#e2bfb0]/30 flex items-center gap-4 cursor-pointer hover:bg-[#fff1ec] transition-all active:scale-[0.98]">
              <div className="w-14 h-14 rounded-xl bg-[#f8ddd2] overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" alt={biz.name} src={biz.heroImage} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#261812]">{biz.name}</p>
                <p className="text-[10px] text-[#5a4136]">{biz.category} · {biz.distance}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8e7164] shrink-0" />
            </div>
          ))}
        </div>
      </div>
      {/* Borough Rewards */}
      <div className="bg-[#ff9969]/20 rounded-2xl p-5 border border-[#ff9969]/30">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-[#a14000]" />
          <h4 className="text-sm font-bold text-[#261812]">Borough Rewards Available</h4>
        </div>
        <p className="text-xs text-[#5a4136] mb-3">Unlock exclusive rewards by engaging with {borough} businesses.</p>
        <button onClick={() => showToast('Borough reward unlocked!', 'success')} className="px-5 py-2.5 bg-[#a14000] text-white rounded-xl text-xs font-bold active:scale-95 transition-all">Unlock Borough Rewards</button>
      </div>
    </div>
  );
}

function HighStreetTabContent({ streets, showToast }: { streets: typeof MOCK_HIGH_STREET; showToast: (msg: string, type: ToastType) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#a14000] to-[#ff6900] text-white p-5 rounded-2xl">
        <Store className="w-6 h-6 mb-2" />
        <h3 className="text-lg font-extrabold">High Street Activity</h3>
        <p className="text-xs text-orange-100 mt-1">Active storefronts, live campaigns & walk-in promotions</p>
      </div>
      {streets.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-[#e2bfb0]/30">
          <Store className="w-8 h-8 text-[#8e7164] mx-auto mb-2" />
          <p className="text-xs font-bold text-[#5a4136]">No High Street Activity</p>
          <p className="text-[10px] text-[#8e7164] mt-1">Check back for high street promotions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {streets.map(s => (
            <div key={s.id} className="bg-white rounded-2xl overflow-hidden border border-[#e2bfb0]/30 shadow-sm">
              <div className="h-40 relative">
                <img className="w-full h-full object-cover" alt={s.name} src={s.image} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <h4 className="font-bold text-lg">{s.name}</h4>
                  <p className="text-xs text-white/80">{s.desc}</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">{s.deals}</span>
                  <span className="text-[10px] text-[#5a4136]">QR-enabled stores</span>
                </div>
                <button onClick={() => showToast('Exploring high street!', 'info')} className="px-4 py-2 bg-[#a14000] text-white rounded-xl text-[10px] font-bold active:scale-95 transition-all">Explore</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Walk-in Promotions */}
      <div className="bg-white rounded-2xl p-5 border border-[#e2bfb0]/30">
        <h4 className="text-sm font-bold text-[#261812] mb-3">Walk-in Promotions</h4>
        <div className="grid grid-cols-2 gap-3">
          {['20% Off First Visit', 'Free Coffee with Walk-in', 'Double Points Today', 'Free Trial Session'].map((p, i) => (
            <div key={i} className="bg-[#fff1ec] rounded-xl p-3 text-center">
              <QrCode className="w-5 h-5 text-[#a14000] mx-auto mb-1" />
              <p className="text-[10px] font-bold text-[#261812]">{p}</p>
              <span className="text-[8px] text-[#5a4136]">QR required</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoriesTabContent({ categories, onNavigate }: { categories: typeof CATEGORIES; onNavigate: (label: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#fff1ec] p-5 rounded-2xl border border-[#e2bfb0]/30">
        <Layers className="w-6 h-6 text-[#a14000] mb-2" />
        <h3 className="text-lg font-extrabold text-[#261812]">Browse by Category</h3>
        <p className="text-xs text-[#5a4136] mt-1">Find businesses, offers, and events by category</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {categories.map(c => {
          const Icon = c.icon;
          return (
            <button key={c.id} onClick={() => onNavigate(c.label)}
              className="bg-white rounded-2xl p-5 border border-[#e2bfb0]/30 text-center hover:shadow-md transition-all active:scale-95">
              <div className={`w-14 h-14 rounded-2xl ${c.color} flex items-center justify-center mx-auto mb-3`}>
                <Icon className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-[#261812]">{c.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RecommendedTabContent({ businesses, onNavigate, points }: { businesses: BusinessDetails[]; onNavigate: (id: string) => void; points: number }) {
  const recommendations = businesses.slice(0, 3);
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#ff9969] to-[#ff6900] text-white p-5 rounded-2xl">
        <Sparkles className="w-6 h-6 mb-2" />
        <h3 className="text-lg font-extrabold">Recommended for You</h3>
        <p className="text-xs text-orange-100 mt-1">Personalized based on your location, interests & browsing history</p>
      </div>
      {recommendations.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-[#e2bfb0]/30">
          <Sparkles className="w-8 h-8 text-[#8e7164] mx-auto mb-2" />
          <p className="text-xs font-bold text-[#5a4136]">No Recommendations Yet</p>
          <p className="text-[10px] text-[#8e7164] mt-1">Browse more businesses to get personalized picks</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((biz, i) => (
            <div key={biz.id} onClick={() => onNavigate(biz.id)}
              className="bg-white rounded-2xl overflow-hidden border border-[#e2bfb0]/30 shadow-sm cursor-pointer hover:shadow-md transition-all group">
              <div className="flex gap-4 p-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#f8ddd2]">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={biz.name} src={biz.heroImage} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[8px] font-bold text-[#a14000] bg-[#ff9969]/20 px-2 py-0.5 rounded-full uppercase">Match {90 - i * 10}%</span>
                    {i === 0 && <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Best Pick</span>}
                  </div>
                  <p className="text-sm font-bold text-[#261812]">{biz.name}</p>
                  <p className="text-[10px] text-[#5a4136]">{biz.category} · {biz.distance}</p>
                  <p className="text-[9px] text-[#8e7164] mt-1">Based on your {i === 0 ? 'coffee preferences' : i === 1 ? 'fitness activity' : 'browsing history'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* AI Picked Section */}
      <div className="bg-white rounded-2xl p-5 border border-[#e2bfb0]/30">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[#a14000]" />
          <h4 className="text-sm font-bold text-[#261812]">AI Picked for You</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f8ddd2] rounded-2xl p-4 text-center">
            <Coffee className="w-8 h-8 text-[#a14000] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#261812]">Morning Blend</p>
            <span className="text-[8px] font-bold text-[#009efb]">REDEEM {points > 500 ? '200' : '400'} PTS</span>
          </div>
          <div className="bg-[#f8ddd2] rounded-2xl p-4 text-center">
            <Ticket className="w-8 h-8 text-[#a14000] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#261812]">Rooftop Jazz</p>
            <span className="text-[8px] font-bold text-[#ff6900]">EXCLUSIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentlyViewedTabContent({ items, onNavigate }: { items: typeof RECENTLY_VIEWED; onNavigate: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#fff1ec] p-5 rounded-2xl border border-[#e2bfb0]/30">
        <Clock className="w-6 h-6 text-[#a14000] mb-2" />
        <h3 className="text-lg font-extrabold text-[#261812]">Recently Viewed</h3>
        <p className="text-xs text-[#5a4136] mt-1">Quick access to your recently browsed businesses</p>
      </div>
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-[#e2bfb0]/30">
          <Clock className="w-8 h-8 text-[#8e7164] mx-auto mb-2" />
          <p className="text-xs font-bold text-[#5a4136]">No Recently Viewed</p>
          <p className="text-[10px] text-[#8e7164] mt-1">Start exploring businesses to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} onClick={() => onNavigate(item.id)}
              className="bg-white rounded-2xl p-4 border border-[#e2bfb0]/30 flex items-center gap-4 cursor-pointer hover:bg-[#fff1ec] transition-all active:scale-[0.98]">
              <div className="w-12 h-12 rounded-xl bg-[#f8ddd2] flex items-center justify-center text-[#a14000]">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#261812]">{item.name}</p>
                <p className="text-[10px] text-[#5a4136]">{item.category}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] text-[#8e7164]">{item.time}</p>
                <ChevronRight className="w-4 h-4 text-[#8e7164] ml-auto mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DiscoverLocal;
