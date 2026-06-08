'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft,
  Heart,
  Share2,
  QrCode,
  UserPlus,
  Trophy,
  ChevronRight,
  Star,
  Coffee,
  Calendar,
  Map as MapIcon,
  Compass,
  User,
  Bell,
  Search,
  ShoppingBag,
  Utensils,
  Lock,
  Bolt,
  Dumbbell,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  X,
  Sparkle
} from 'lucide-react';
import { useCustomerPoints } from '@/context/CustomerPointsContext';
import { BUSINESS_MOCK_DATA, BusinessDetails } from '@/lib/mock-data/business-mock-data';

type DiscoverSubView = 'list' | 'map' | 'details';

export const DiscoverLocal: React.FC = () => {
  const { points, addPoints, redeemPoints } = useCustomerPoints();
  const [currentView, setCurrentView] = useState<DiscoverSubView>('list');
  const [previousView, setPreviousView] = useState<DiscoverSubView>('list');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('brew-co');
  
  // Interactive UI State
  const [activeTab, setActiveTab] = useState<string>('Nearby');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFollowing, setIsFollowing] = useState<Record<string, boolean>>({});
  const [registeredEvents, setRegisteredEvents] = useState<Record<string, boolean>>({});
  const [redeemedOffers, setRedeemedOffers] = useState<Record<string, boolean>>({});
  const [followedBusinesses, setFollowedBusinesses] = useState<Record<string, boolean>>({});
  const [activeMapPin, setActiveMapPin] = useState<'cafe' | 'event'>('cafe');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Toast / Modal State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrScanSuccess, setQrScanSuccess] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const newVal = !prev[id];
      showToast(newVal ? 'Added to favorites!' : 'Removed from favorites!', 'info');
      return { ...prev, [id]: newVal };
    });
  };

  const handleNavigateToDetails = (id: string) => {
    setSelectedBusinessId(id);
    setPreviousView(currentView);
    setCurrentView('details');
  };

  const handleBack = () => {
    setCurrentView(previousView);
  };

  const handleToggleFollow = (id: string) => {
    setFollowedBusinesses(prev => {
      const newVal = !prev[id];
      showToast(newVal ? `Following ${BUSINESS_MOCK_DATA[id]?.name}!` : `Unfollowed ${BUSINESS_MOCK_DATA[id]?.name}`, 'info');
      return { ...prev, [id]: newVal };
    });
  };

  const handleRedeemPromotion = (id: string, promoTitle: string) => {
    if (redeemedOffers[id]) {
      showToast('Offer already claimed!', 'error');
      return;
    }
    setRedeemedOffers(prev => ({ ...prev, [id]: true }));
    addPoints(100);
    showToast(`Claimed ${promoTitle}! +100 Points added!`, 'success');
  };

  const handleRegisterEvent = (eventId: string, eventTitle: string) => {
    const isRegistered = registeredEvents[eventId];
    setRegisteredEvents(prev => ({ ...prev, [eventId]: !isRegistered }));
    showToast(
      isRegistered 
        ? `Cancelled registration for ${eventTitle}` 
        : `Registered for ${eventTitle}! See you there!`,
      isRegistered ? 'info' : 'success'
    );
  };

  const handleRedeemReward = (businessId: string, rewardTitle: string, cost: number) => {
    if (points < cost) {
      showToast(`Insufficient points! You need ${cost} pts.`, 'error');
      return;
    }
    const success = redeemPoints(cost);
    if (success) {
      const voucherCode = `${businessId.substring(0, 3).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
      showToast(`Redeemed ${rewardTitle}! Code: ${voucherCode} copied to clipboard!`, 'success');
      if (typeof navigator !== 'undefined') {
        navigator.clipboard.writeText(voucherCode).catch(() => {});
      }
    } else {
      showToast('Redemption failed. Please try again.', 'error');
    }
  };

  const handleQRScan = () => {
    setQrScanSuccess(true);
    window.setTimeout(() => {
      setIsQRModalOpen(false);
      setQrScanSuccess(false);
      addPoints(50);
      showToast('QR Code Scanned Successfully! +50 Points earned!', 'success');
    }, 2000);
  };

  // Filtering for list view
  const currentBusinessList = Object.values(BUSINESS_MOCK_DATA).filter(biz => {
    const matchesSearch = biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          biz.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen text-slate-800 bg-[#f9f9fc] font-sans antialiased relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-bold ${
            toastType === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
            toastType === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' :
            'bg-indigo-50 text-indigo-700 border-indigo-100'
          }`}>
            <Sparkles className={`w-4 h-4 ${toastType === 'success' ? 'text-emerald-500' : toastType === 'error' ? 'text-rose-500' : 'text-indigo-500'}`} />
            {toastMessage}
          </div>
        </div>
      )}

      {/* 1. LIST VIEW */}
      {currentView === 'list' && (
        <div className="animate-in fade-in duration-300">
          {/* Header Dashboard Banner */}
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500 bg-indigo-50 shrink-0 flex items-center justify-center font-bold text-indigo-600">
                U
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Borough Hub</span>
                <span className="text-sm font-black text-indigo-600 leading-none">Discover Nearby</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-[#fcd400] text-[#6e5c00] px-3.5 py-1.5 rounded-full shadow-sm shrink-0">
              <Sparkles className="w-4 h-4 fill-[#6e5c00] text-[#6e5c00]" />
              <span className="text-xs font-black tracking-tight">{points.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Search & Filter Area */}
          <div className="mb-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm" 
                placeholder="Search businesses, rewards, events..." 
                type="text"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Tabs */}
          <nav className="flex gap-3 overflow-x-auto hide-scrollbar mb-6 -mx-4 px-4">
            {['Nearby', 'Trending', 'New', 'Recommended', 'Borough Favorites'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Section: Active Event Teaser */}
          <section className="mb-8">
            <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-lg shadow-indigo-900/5 group border border-slate-100">
              <img 
                alt="Urban Night Market" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 flex flex-col justify-end">
                <span className="inline-block px-3 py-1 rounded-full bg-[#fcd400] text-[#6e5c00] text-[10px] font-bold uppercase tracking-wider mb-2 w-fit">
                  Weekend Event
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">Central Plaza Summer Festival</h3>
                <p className="text-white/80 text-xs mt-0.5">Live Music • Food Pop-ups • 500+ XP</p>
              </div>
            </div>
          </section>

          {/* Section: Nearby Favorites (Bento Grid) */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Nearby Favorites</h2>
              <span className="text-xs font-semibold text-slate-400">Showing {currentBusinessList.length} shops</span>
            </div>

            {currentBusinessList.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400 text-xs font-semibold">
                No businesses match your search query.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentBusinessList.map((biz) => {
                  const hasFavorite = favorites[biz.id];
                  
                  return (
                    <div 
                      key={biz.id}
                      onClick={() => handleNavigateToDetails(biz.id)}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col group cursor-pointer"
                    >
                      <div className="relative h-48 overflow-hidden bg-slate-100 shrink-0">
                        <img 
                          alt={biz.name} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                          src={biz.heroImage}
                        />
                        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                          <button 
                            onClick={(e) => toggleFavorite(biz.id, e)}
                            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-sm text-slate-400 hover:text-red-500 active:scale-90 transition-transform"
                          >
                            <Heart className={`w-4 h-4 ${hasFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-indigo-600 text-[9px] font-bold shadow-sm uppercase tracking-wider">
                            {biz.category}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold shadow-sm uppercase tracking-wider">
                            {biz.distance}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{biz.name}</h4>
                            <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0 text-xs">
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                              <span>{biz.rating}</span>
                            </div>
                          </div>
                          <p className="text-slate-400 text-[11px] font-semibold">{biz.reviewCount}</p>
                        </div>

                        {/* Customer Progress Integration */}
                        <div className="mt-4 pt-3 border-t border-slate-50 space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                            <span>Points: {points} / {biz.nextTierPoints} pts</span>
                            <span className="text-indigo-600">{biz.tierName}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, (points / biz.nextTierPoints) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* New Section: Gamified Progress */}
          <section className="mt-8 bg-indigo-600 text-white p-6 rounded-3xl relative overflow-hidden shadow-lg shadow-indigo-600/10">
            <div className="relative z-10 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight">Weekly Explorer Goal</h3>
                <p className="text-xs text-indigo-100 font-medium">Visit 2 more new shops to unlock the &apos;Urban Pioneer&apos; badge.</p>
              </div>

              <div className="flex gap-4 items-center flex-wrap">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-amber-400 flex items-center justify-center text-[#6e5c00] shadow-sm shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-emerald-500 flex items-center justify-center text-white shadow-sm shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-700/80 flex items-center justify-center text-indigo-200 shadow-sm shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-700/80 flex items-center justify-center text-indigo-200 shadow-sm shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-xs font-bold text-white bg-indigo-700/50 px-3.5 py-1.5 rounded-full">2/4 Visited</span>
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </section>

          {/* Floating Action Button for Map View */}
          <button 
            onClick={() => {
              setPreviousView('list');
              setCurrentView('map');
            }}
            className="fixed bottom-24 right-5 z-40 flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-full shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <MapIcon className="w-4 h-4" />
            <span className="text-xs font-bold">Map View</span>
          </button>
        </div>
      )}

      {/* 2. MAP VIEW */}
      {currentView === 'map' && (
        <div className="animate-in fade-in duration-300 flex flex-col h-[75vh] relative overflow-hidden rounded-3xl border border-slate-100 shadow-sm bg-slate-50">
          
          {/* Interactive Map Background */}
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover opacity-60 mix-blend-multiply select-none pointer-events-none" 
              alt="Grid Map"
              src="https://lh3.googleusercontent.com/aida/AP1WRLu_rxNcOymbzmBWRdwj094DF1sdiIggTgKnQyn9Il_nrBq2MupMoMt5mcbFoHqUiV5jZvE6SsH6a_oTDSldxWBA00slFmkOm9V8EDQOgyxf-zw-vtWbLh6Gh_hSiD_wZzG4Yp3o6SuZlBVauXQ9_28UrKnW17Yv-Nf61K2Wll47HLT0cMFGwXsRU_hpQCvWMEsCLI7aI4rzvpVAVqVFVgbaZSGe6StWQ98i65xSfxVx2LRAd64pVhzR68o"
            />

            {/* Map Pin 1: Active Offer (Brew & Co) */}
            <div 
              onClick={() => setActiveMapPin('cafe')}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group scale-90 sm:scale-100"
            >
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-transform duration-200 ${
                  activeMapPin === 'cafe' ? 'bg-[#fcd400] text-[#6e5c00] scale-110 ring-4 ring-[#fcd400]/25' : 'bg-white text-slate-500'
                }`}>
                  <Coffee className="w-5 h-5 fill-current" />
                </div>
                <div className="mt-2 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-md whitespace-nowrap">
                  <p className="text-[10px] font-black text-slate-800">The Artisan Grind • 20% OFF</p>
                </div>
              </div>
            </div>

            {/* Map Pin 2: Event (Summer Festival) */}
            <div 
              onClick={() => setActiveMapPin('event')}
              className="absolute top-[28%] left-[60%] z-20 cursor-pointer group scale-90 sm:scale-100"
            >
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-transform duration-200 ${
                  activeMapPin === 'event' ? 'bg-indigo-600 text-white scale-110 ring-4 ring-indigo-500/25' : 'bg-white text-slate-500'
                }`}>
                  <Calendar className="w-4 h-4 fill-current" />
                </div>
                <div className="mt-2 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-md whitespace-nowrap">
                  <p className="text-[10px] font-black text-slate-800">Summer Festival</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Search overlay */}
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-md text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Search this area..." 
                type="text"
                readOnly
              />
            </div>
          </div>

          {/* Floating Drawer / Bottom Panel */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-100/50 shadow-xl max-w-md mx-auto space-y-4 animate-in slide-in-from-bottom-6 duration-300">
              
              <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-[9px] uppercase tracking-wider w-fit shrink-0">
                <Sparkle className="w-3 h-3 fill-indigo-500 text-indigo-500" />
                Featured Nearby
              </div>

              {activeMapPin === 'cafe' ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded w-fit block">
                      Coffee Shop
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-sm leading-snug">The Artisan Grind</h4>
                    <p className="text-[11px] font-semibold text-slate-400 leading-normal line-clamp-1">
                      Cozy loft vibe, roasted single-origin coffees, and limited 20% off espresso promotion.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleNavigateToDetails('brew-co')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-3 rounded-2xl transition-all active:scale-95 shrink-0"
                  >
                    View
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-fit block">
                      Event Spot
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-sm leading-snug">Central Plaza Event Space</h4>
                    <p className="text-[11px] font-semibold text-slate-400 leading-normal line-clamp-1">
                      Central Plaza Summer Festival with live performances, food trucks, and rewards.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleNavigateToDetails('urban-threads')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-3 rounded-2xl transition-all active:scale-95 shrink-0"
                  >
                    View
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Floating Action Button to List View */}
          <button 
            onClick={() => {
              setPreviousView('map');
              setCurrentView('list');
            }}
            className="fixed bottom-24 right-5 z-40 flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-full shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Compass className="w-4 h-4" />
            <span className="text-xs font-bold">List View</span>
          </button>
        </div>
      )}

      {/* 3. BUSINESS DETAILS VIEW */}
      {currentView === 'details' && (
        <div className="animate-in fade-in duration-300 space-y-6">
          
          {/* Header Action Section */}
          <header className="flex justify-between items-center bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all active:scale-90"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-600" />
              </button>
              <h1 className="font-extrabold text-slate-800 text-sm tracking-tight">{BUSINESS_MOCK_DATA[selectedBusinessId]?.name}</h1>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={(e) => toggleFavorite(selectedBusinessId, e)}
                className="p-2 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all active:scale-90 text-slate-400 hover:text-red-500"
              >
                <Heart className={`w-4 h-4 ${favorites[selectedBusinessId] ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <button 
                onClick={() => showToast('Share link copied to clipboard!', 'info')}
                className="p-2 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all active:scale-90 text-slate-400 hover:text-indigo-600"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Hero Section */}
          <section className="relative h-64 w-full rounded-3xl overflow-hidden shadow-md border border-slate-100/50 group">
            <img 
              alt="Store Hero" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102" 
              src={BUSINESS_MOCK_DATA[selectedBusinessId]?.heroImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-6 text-white space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  {BUSINESS_MOCK_DATA[selectedBusinessId]?.statusTag}
                </span>
                
                <div className="flex items-center bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  <Star className="text-amber-400 w-3.5 h-3.5 fill-amber-400 mr-1" />
                  <span className="text-[10px] font-black">{BUSINESS_MOCK_DATA[selectedBusinessId]?.rating} ({BUSINESS_MOCK_DATA[selectedBusinessId]?.reviewCount})</span>
                </div>
              </div>
              <p className="text-xs text-white/80 font-medium">{BUSINESS_MOCK_DATA[selectedBusinessId]?.category} • {BUSINESS_MOCK_DATA[selectedBusinessId]?.distance}</p>
            </div>
          </section>

          {/* Action Grid: Bento Style */}
          <section className="grid grid-cols-2 gap-4">
            
            {/* Flash Sale Card (Primary) */}
            <div className="col-span-2 bg-indigo-600 text-white p-5 rounded-3xl flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-1.5">
                <span className="bg-amber-400 text-[#6e5c00] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider w-fit inline-block mb-1">
                  LIMITED TIME
                </span>
                <h2 className="text-base font-extrabold tracking-tight leading-snug">{BUSINESS_MOCK_DATA[selectedBusinessId]?.flashSaleTitle}</h2>
                <p className="text-xs text-indigo-100 font-medium max-w-[85%] leading-relaxed">
                  {BUSINESS_MOCK_DATA[selectedBusinessId]?.flashSaleDesc}
                </p>
              </div>
              <button 
                onClick={() => handleRedeemPromotion(selectedBusinessId, BUSINESS_MOCK_DATA[selectedBusinessId]?.flashSaleTitle)}
                disabled={redeemedOffers[selectedBusinessId]}
                className={`relative z-10 w-fit mt-5 px-6 py-3 rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 border ${
                  redeemedOffers[selectedBusinessId] 
                    ? 'bg-indigo-700/50 text-indigo-300 border-indigo-700/20 cursor-default' 
                    : 'bg-[#fcd400] text-[#6e5c00] border-[#fcd400] hover:scale-102'
                }`}
              >
                {redeemedOffers[selectedBusinessId] ? 'Offer Redeemed' : 'Redeem Offer'}
              </button>
              
              {/* Background Accent Icon */}
              <div className="absolute -right-4 -bottom-4 opacity-10 shrink-0">
                <Bolt className="w-24 h-24 stroke-[4px]" />
              </div>
            </div>

            {/* Scan QR */}
            <button 
              onClick={() => setIsQRModalOpen(true)}
              className="flex flex-col items-center justify-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group active:scale-95 shrink-0"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-indigo-600">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Scan QR</span>
            </button>

            {/* Follow Store */}
            <button 
              onClick={() => handleToggleFollow(selectedBusinessId)}
              className="flex flex-col items-center justify-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group active:scale-95 shrink-0"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-emerald-600">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {followedBusinesses[selectedBusinessId] ? 'Following' : 'Follow'}
              </span>
            </button>
          </section>

          {/* Gamification: Progress Section */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex justify-between items-center gap-2">
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-800">Your Progress</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {BUSINESS_MOCK_DATA[selectedBusinessId]?.tierName}
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-1 text-indigo-600 font-black text-lg">
                  <Sparkles className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                  <span>{points}</span>
                </div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Available Points</p>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-1000 w-[85%] relative"
                style={{ width: `${Math.min(100, (points / BUSINESS_MOCK_DATA[selectedBusinessId]?.nextTierPoints) * 100)}%` }}
              >
                <div className="absolute top-0 right-0 w-1 h-full bg-white/30 animate-pulse"></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 flex-wrap gap-2 pt-1">
              <span>{Math.max(0, BUSINESS_MOCK_DATA[selectedBusinessId]?.nextTierPoints - points)} pts to Level Up</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <Trophy className="w-3.5 h-3.5" />
                Exclusive Member Benefit Unlocked
              </span>
            </div>
          </section>

          {/* Promotions & Events */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-800">Upcoming Events</h3>
              <span className="text-[10px] font-bold text-slate-400 border border-slate-200 bg-white px-2 py-0.5 rounded-full uppercase">ZONE SCHEDULE</span>
            </div>
            
            <div className="space-y-3">
              {BUSINESS_MOCK_DATA[selectedBusinessId]?.events.map((event, index) => {
                const isRegistered = registeredEvents[`${selectedBusinessId}-event-${index}`];
                
                return (
                  <div key={index} className="flex gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm items-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-400 text-[#6e5c00] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] font-black uppercase tracking-wider">{event.date}</span>
                      <span className="text-xl font-black leading-none mt-0.5">{event.day}</span>
                    </div>
                    
                    <div className="flex-grow min-w-0 space-y-1">
                      <h4 className="font-extrabold text-slate-800 text-xs truncate">{event.title}</h4>
                      <p className="text-[10px] font-semibold text-slate-400 leading-normal line-clamp-1">{event.desc} • {event.time}</p>
                    </div>

                    <button 
                      onClick={() => handleRegisterEvent(`${selectedBusinessId}-event-${index}`, event.title)}
                      className={`px-4 py-2 rounded-2xl text-[10px] font-bold transition-all active:scale-95 shrink-0 ${
                        isRegistered 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/10'
                      }`}
                    >
                      {isRegistered ? 'Joined' : 'Join'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Rewards Grid */}
          <section className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800">Tier Rewards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BUSINESS_MOCK_DATA[selectedBusinessId]?.rewards.map((reward, index) => (
                <div key={index} className="relative rounded-3xl overflow-hidden group shadow-md aspect-[16/9] border border-slate-100/30">
                  <img 
                    alt={reward.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                    src={reward.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 flex flex-col justify-end space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`${reward.tagColor} text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest w-fit`}>
                        {reward.tag}
                      </span>
                      <span className="text-[#fcd400] font-black text-xs shrink-0">{reward.cost} pts</span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="min-w-0">
                        <h4 className="text-white font-extrabold text-xs truncate">{reward.title}</h4>
                        <p className="text-white/60 text-[9px] font-medium mt-0.5">Claim reward</p>
                      </div>
                      <button 
                        onClick={() => handleRedeemReward(selectedBusinessId, reward.title, reward.cost)}
                        className="bg-white hover:bg-slate-50 text-indigo-600 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 shrink-0"
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* QR Scanner Mock Modal */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 space-y-6 animate-in zoom-in-95 duration-200 text-center">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-slate-800">Scan Mall QR</span>
              <button 
                onClick={() => setIsQRModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-square w-full max-w-[200px] mx-auto border-4 border-dashed border-indigo-500 rounded-3xl flex items-center justify-center bg-slate-50 overflow-hidden group">
              {qrScanSuccess ? (
                <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
              ) : (
                <div className="space-y-2 flex flex-col items-center">
                  <QrCode className="w-16 h-16 text-indigo-500 opacity-80" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider animate-pulse">Scanning...</span>
                </div>
              )}
              {/* Scanline animation */}
              {!qrScanSuccess && (
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/80 shadow-md animate-scan"></div>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">Position QR code inside frame</h4>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Scan store codes at counters or checkout receipt codes to instantly redeem cashback and loyalty stamps.
              </p>
            </div>

            {!qrScanSuccess && (
              <button 
                onClick={handleQRScan}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-2xl shadow-md shadow-indigo-600/10 transition-all active:scale-95"
              >
                Simulate Successful Scan
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
