'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft,
  Heart,
  Share2,
  Lock,
  Unlock,
  Check,
  Star,
  ChevronRight,
  Clock,
  Sparkles,
  Trophy,
  Coffee,
  Ticket,
  Zap,
  Bookmark,
  Info,
  MapPin,
  History,
  X
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { useCustomerPoints } from '@/context/CustomerPointsContext';
import { REWARDS_MOCK_DATA, RewardDetails } from '@/lib/mock-data/rewards-mock-data';

type RewardsTab = 'available' | 'active' | 'redeemed' | 'expiring';
type RewardsSubView = 'dashboard' | 'details';

export const RewardsView: React.FC = () => {
  const { userName } = useSelector((state: RootState) => state.auth);
  const { points, redeemPoints } = useCustomerPoints();
  const [subView, setSubView] = useState<RewardsSubView>('dashboard');
  const [selectedRewardId, setSelectedRewardId] = useState<string>('coffee-duo');
  const [activeTab, setActiveTab] = useState<RewardsTab>('available');

  // Customer Loyalty State
  const [claimedRewardIds, setClaimedRewardIds] = useState<string[]>([]);
  const [redeemedRewardIds, setRedeemedRewardIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNavigateToDetails = (id: string) => {
    setSelectedRewardId(id);
    setSubView('details');
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const newVal = !prev[id];
      showToast(newVal ? 'Added to saved rewards!' : 'Removed from saved rewards!', 'info');
      return { ...prev, [id]: newVal };
    });
  };

  const handleClaimReward = (reward: RewardDetails) => {
    const isAlreadyClaimed = claimedRewardIds.includes(reward.id);
    if (isAlreadyClaimed) {
      showToast('You already claimed this reward! Check the "Active" tab.', 'info');
      return;
    }

    if (points < reward.cost) {
      showToast(`Insufficient points! You need ${reward.cost} pts.`, 'error');
      return;
    }

    const success = redeemPoints(reward.cost);
    if (success) {
      setClaimedRewardIds(prev => [...prev, reward.id]);
      showToast(`Success! Redeemed "${reward.title}" for ${reward.cost} pts.`, 'success');
    } else {
      showToast('Redemption failed. Please try again.', 'error');
    }
  };

  const handleMarkAsScanned = (id: string) => {
    if (redeemedRewardIds.includes(id)) return;
    setRedeemedRewardIds(prev => [...prev, id]);
    setClaimedRewardIds(prev => prev.filter(item => item !== id));
    showToast('Reward claimed at counter! Thank you.', 'success');
  };

  // Filtering rewards
  const filteredRewards = Object.values(REWARDS_MOCK_DATA).filter(reward => {
    const isClaimed = claimedRewardIds.includes(reward.id);
    const isUsed = redeemedRewardIds.includes(reward.id);

    if (activeTab === 'available') {
      return !isClaimed && !isUsed;
    }
    if (activeTab === 'active') {
      return isClaimed;
    }
    if (activeTab === 'redeemed') {
      return isUsed;
    }
    if (activeTab === 'expiring') {
      // Show rewards expiring within 3 days (mocked)
      return !isClaimed && !isUsed && reward.expiryText.includes('days') && parseInt(reward.expiryText.replace(/\D/g, '')) <= 3;
    }
    return true;
  });

  const selectedReward = REWARDS_MOCK_DATA[selectedRewardId] || REWARDS_MOCK_DATA['coffee-duo'];
  const isSelectedRewardClaimed = claimedRewardIds.includes(selectedReward.id);
  const isSelectedRewardRedeemed = redeemedRewardIds.includes(selectedReward.id);

  // Icon mapper
  const renderRewardIcon = (type: string, className: string = "w-5 h-5") => {
    switch (type) {
      case 'workspace_premium':
        return <Trophy className={`${className} text-amber-500`} />;
      case 'confirmation_number':
        return <Ticket className={`${className} text-indigo-500`} />;
      case 'flash_on':
        return <Zap className={`${className} text-orange-500`} />;
      default:
        return <Coffee className={`${className} text-amber-600`} />;
    }
  };

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

      {/* 1. DASHBOARD VIEW */}
      {subView === 'dashboard' && (
        <div className="animate-in fade-in duration-300">
          
          {/* Header Banner */}
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500 bg-indigo-50 shrink-0 flex items-center justify-center font-bold text-indigo-600">
                U
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rewards Hub</span>
                <span className="text-sm font-black text-indigo-600 leading-none">MCOM Mall</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-[#fcd400] text-[#6e5c00] px-3.5 py-1.5 rounded-full shadow-sm shrink-0">
              <Sparkles className="w-4 h-4 fill-[#6e5c00] text-[#6e5c00]" />
              <span className="text-xs font-black tracking-tight">{points.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Loyalty Progress Section */}
          <section className="mb-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-end flex-wrap gap-2">
                <div>
                  <span className="font-bold text-[9px] text-slate-400 uppercase tracking-widest block mb-1">Current Tier</span>
                  <div className="flex items-center gap-1.5">
                    <Star className="text-[#fcd400] w-5 h-5 fill-[#fcd400]" />
                    <h2 className="text-lg font-black text-slate-800 leading-none">Gold Member</h2>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-600">{points.toLocaleString()} / 5,000 pts</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (points / 5000) * 100)}%` }}
                ></div>
                <div className="absolute top-0 left-0 h-full w-full flex justify-between px-2 items-center opacity-30 pointer-events-none">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                <span>{Math.max(0, 5000 - points).toLocaleString()} pts to Platinum</span>
                <button 
                  onClick={() => showToast('Gold tier benefits active: 1.5x Multiplier, Free Birthday Gifts!', 'info')}
                  className="flex items-center gap-0.5 text-indigo-600 active:scale-95 transition-transform"
                >
                  View Benefits <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Horizontal Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar sticky top-14 bg-[#f9f9fc] z-30">
            {(['available', 'active', 'redeemed', 'expiring'] as RewardsTab[]).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full whitespace-nowrap text-xs font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-[#fcd400] text-[#6e5c00] shadow-sm' 
                    : 'bg-white text-slate-500 border border-slate-100 hover:text-indigo-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Rewards Grid */}
          {filteredRewards.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400 text-xs font-semibold">
              No rewards found under this section.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {filteredRewards.map((reward) => (
                <div 
                  key={reward.id}
                  onClick={() => handleNavigateToDetails(reward.id)}
                  className={`bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100/80 flex flex-col h-full group hover:shadow-md transition-shadow cursor-pointer ${
                    reward.isHot ? 'ring-2 ring-[#fcd400]/50' : ''
                  }`}
                >
                  <div className="h-40 relative bg-slate-100 shrink-0">
                    <img alt={reward.title} className="w-full h-full object-cover" src={reward.image}/>
                    
                    {reward.isHot && (
                      <div className="absolute top-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black shadow-lg flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-white" />
                        HOT DEAL
                      </div>
                    )}
                    
                    {!reward.isHot && (
                      <div className="absolute top-3 left-3 bg-[#fcd400] text-[#6e5c00] px-3 py-1 rounded-full text-[9px] font-black shadow-sm">
                        {reward.cost} PTS
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-extrabold text-slate-800 text-sm leading-tight">{reward.title}</h3>
                        {renderRewardIcon(reward.badgeIcon)}
                      </div>
                      <p className="text-slate-400 text-[11px] font-semibold leading-relaxed mb-4">{reward.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50 shrink-0">
                      <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{reward.expiryText}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeTab === 'available') {
                            handleClaimReward(reward);
                          } else {
                            handleNavigateToDetails(reward.id);
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-[10px] font-bold active:scale-95 transition-transform"
                      >
                        {activeTab === 'available' ? 'Claim' : 'View'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contextual FAB for Rewards Page: Points History */}
          <button 
            onClick={() => setHistoryModalOpen(true)}
            className="fixed right-5 bottom-24 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-90 transition-all z-45"
          >
            <History className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* 2. REWARD DETAILS VIEW */}
      {subView === 'details' && (
        <div className="animate-in fade-in duration-300 space-y-6 pb-24">
          
          {/* Header Action Section */}
          <header className="flex justify-between items-center bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSubView('dashboard')}
                className="p-2 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all active:scale-90"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-600" />
              </button>
              <h1 className="font-extrabold text-slate-800 text-sm tracking-tight">{selectedReward.title}</h1>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={(e) => toggleFavorite(selectedReward.id, e)}
                className="p-2 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all active:scale-90 text-slate-400 hover:text-red-500"
              >
                <Heart className={`w-4 h-4 ${favorites[selectedReward.id] ? 'fill-red-500 text-red-500' : ''}`} />
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
          <section className="relative w-full h-[300px] overflow-hidden rounded-3xl border border-slate-100 shadow-md">
            <img alt={selectedReward.title} className="w-full h-full object-cover" src={selectedReward.image}/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-2 text-white">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fcd400] text-[#6e5c00] text-[9px] font-black uppercase tracking-wider w-fit">
                <Star className="w-3.5 h-3.5 fill-[#6e5c00] mr-1" />
                PREMIUM REWARD
              </span>
              <h2 className="text-xl sm:text-2xl font-black">{selectedReward.title}</h2>
            </div>
          </section>

          {/* Content Canvas */}
          <div className="space-y-6">
            
            {/* Details Card (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Main Info Box */}
              <div className="md:col-span-8 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                      {renderRewardIcon(selectedReward.badgeIcon, "w-6 h-6")}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">{selectedReward.brand}</p>
                      <p className="text-[10px] font-bold text-slate-400">Available at all kiosks</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <p className="text-lg font-black text-indigo-600">{selectedReward.cost} pts</p>
                    <p className="text-[9px] font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedReward.expiryText}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-50 w-full"></div>
                
                <div className="space-y-1.5">
                  <h3 className="text-xs font-black text-slate-800">Description</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    {selectedReward.longDescription}
                  </p>
                </div>
              </div>

              {/* QR Redemption Glass Card */}
              <div className="md:col-span-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-4">
                <p className="text-xs font-black text-slate-800">Redemption QR Code</p>
                
                <div className="bg-white p-4 rounded-2xl border-2 border-indigo-500/10 relative group overflow-hidden">
                  <img 
                    alt="QR Code" 
                    className={`w-32 h-32 select-none pointer-events-none transition-all duration-500 ${
                      isSelectedRewardClaimed ? 'opacity-100 blur-0' : 'opacity-30 blur-[2px]'
                    }`} 
                    src="https://lh3.googleusercontent.com/aida/AP1WRLuBrrLwVCEqPp8totEq6B-Ccmw69aJ3jmFcABXdbgpH2L2hfkVTfsFJnIeUQ5iU-MjZomqpC2cmUZE7sH-6SxYHxqJgcpj6XHO6W5yYXESiA621CTVy_rhaE_TPgQFFZ8QpxylFY79rk49v4bEFlSpD8KWWHAahHHJr8tPQLXenATDNFKRAaULtaw6jH6MzmkQR4RSsXQYtVEoKTlCW_lMAzNuKXyv8MME5flg02_q4FWa_Coy4BcvF_cGn"
                  />
                  
                  {!isSelectedRewardClaimed && (
                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-50/10 backdrop-blur-[1px]">
                      <div 
                        onClick={() => handleClaimReward(selectedReward)}
                        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-90 transition-transform"
                      >
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {isSelectedRewardClaimed && !isSelectedRewardRedeemed && (
                    <div 
                      onClick={() => handleMarkAsScanned(selectedReward.id)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-emerald-600/90 text-white transition-opacity duration-300 cursor-pointer text-[10px] font-black rounded-lg uppercase"
                    >
                      Click to Scan
                    </div>
                  )}
                </div>
                
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {isSelectedRewardClaimed 
                    ? (isSelectedRewardRedeemed ? 'Voucher Used' : 'Scan at counter to activate')
                    : 'Claim this reward to unlock'
                  }
                </p>
              </div>

              {/* Interaction Tiles (Asymmetric) */}
              <div className="md:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                <button 
                  onClick={(e) => toggleFavorite(selectedReward.id, e)}
                  className="bg-white hover:bg-slate-50 border border-slate-100 shadow-sm transition-all p-4 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 shrink-0"
                >
                  <Bookmark className={`w-5 h-5 group-hover:scale-105 transition-transform ${favorites[selectedReward.id] ? 'text-red-500 fill-red-500' : 'text-indigo-600'}`} />
                  <span className="text-[10px] font-bold text-slate-700">
                    {favorites[selectedReward.id] ? 'Saved' : 'Save'}
                  </span>
                </button>
                <button 
                  onClick={() => showToast('Share link copied to clipboard!', 'info')}
                  className="bg-white hover:bg-slate-50 border border-slate-100 shadow-sm transition-all p-4 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 shrink-0"
                >
                  <Share2 className="w-5 h-5 text-indigo-600 group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-700">Share</span>
                </button>
                <button 
                  onClick={() => showToast('Terms: Valid for 30 days after claiming. 1 voucher per customer.', 'info')}
                  className="bg-white hover:bg-slate-50 border border-slate-100 shadow-sm transition-all p-4 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 shrink-0"
                >
                  <Info className="w-5 h-5 text-indigo-600 group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-700">View Terms</span>
                </button>
                <button 
                  onClick={() => showToast('Navigating to nearest booth...', 'info')}
                  className="bg-white hover:bg-slate-50 border border-slate-100 shadow-sm transition-all p-4 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 shrink-0"
                >
                  <MapPin className="w-5 h-5 text-indigo-600 group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-700">Find Store</span>
                </button>
              </div>
            </div>

            {/* Gamification Progress */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Trophy className="w-4 h-4 text-indigo-500" />
                  <span>Next Milestone: Platinum Status</span>
                </div>
                <span className="text-[10px] font-bold text-indigo-600">150 / 500 XP</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold italic">
                &quot;You&apos;re just 3 coffees away from your next reward boost!&quot;
              </p>
            </div>
          </div>

          {/* Fixed Action Bar (Mobile Only) */}
          <footer className="fixed bottom-0 left-0 w-full z-40 px-5 py-4 bg-white/95 backdrop-blur-md border-t border-slate-100 md:hidden flex justify-center">
            {isSelectedRewardRedeemed ? (
              <div className="w-full max-w-md bg-slate-100 text-slate-500 font-bold text-xs py-4 rounded-full flex items-center justify-center gap-2">
                REWARD REDEEMED
                <Check className="w-4 h-4" />
              </div>
            ) : isSelectedRewardClaimed ? (
              <button 
                onClick={() => handleMarkAsScanned(selectedReward.id)}
                className="w-full max-w-md bg-emerald-600 text-white font-bold text-xs py-4 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                VOUCHER ACTIVE (SCAN NOW)
                <Unlock className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => handleClaimReward(selectedReward)}
                className="w-full max-w-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-4 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                REDEEM REWARD
                <Zap className="w-4 h-4 fill-current" />
              </button>
            )}
          </footer>
        </div>
      )}

      {/* Points History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-800">Points History</h3>
              </div>
              <button 
                onClick={() => setHistoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Initial Balance</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Account Sign-up Welcome</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-600">+1,240 pts</span>
              </div>
              
              {claimedRewardIds.map(id => {
                const item = REWARDS_MOCK_DATA[id];
                if (!item) return null;
                return (
                  <div key={id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Claimed {item.title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{item.brand}</p>
                    </div>
                    <span className="text-xs font-extrabold text-rose-600">-{item.cost} pts</span>
                  </div>
                );
              })}

              {redeemedRewardIds.map(id => {
                const item = REWARDS_MOCK_DATA[id];
                if (!item) return null;
                return (
                  <div key={id} className="flex justify-between items-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <div>
                      <h4 className="text-xs font-black text-emerald-700">Scanned {item.title}</h4>
                      <p className="text-[10px] text-emerald-600/70 font-semibold">Used at {item.brand}</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700">Used</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RewardsView;
