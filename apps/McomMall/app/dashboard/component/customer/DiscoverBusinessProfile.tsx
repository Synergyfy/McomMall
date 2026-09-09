'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Heart, Share2, QrCode, UserPlus, Star, Coffee, Calendar, Map,
  ShoppingBag, Dumbbell, Lock, Zap, CheckCircle, Sparkles, X, Award, Info,
  Store, Clock, Phone, Mail, MapPin, MessageCircle, BookOpen,
  ChevronRight, Check, Users, Gift, Tag,
} from 'lucide-react';
import api from '@/service/api';
import { useDiscoverEvents, useDiscoverRewards } from '@/hooks/useDiscover';

type ProfileTab = 'storefront' | 'promotions' | 'events' | 'rewards' | 'reviews' | 'about';

const PROFILE_TABS: { id: ProfileTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'storefront', label: 'Storefront', icon: Store },
  { id: 'promotions', label: 'Promotions', icon: Tag },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'rewards', label: 'Rewards', icon: Award },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'about', label: 'About', icon: Info },
];

const MOCK_REVIEWS = [
  { id: 'r1', user: 'Sarah M.', rating: 5, text: 'Amazing service! The team was incredibly helpful and friendly.', date: '2 days ago', avatar: 'SM' },
  { id: 'r2', user: 'James K.', rating: 4, text: 'Great quality products. Will definitely come back again soon.', date: '1 week ago', avatar: 'JK' },
  { id: 'r3', user: 'Priya R.', rating: 5, text: 'Best experience in the borough! Love the rewards program.', date: '2 weeks ago', avatar: 'PR' },
];

interface DiscoverBusinessProfileProps {
  businessId: string;
  points: number;
  favorites: Record<string, boolean>;
  followedBusinesses: Record<string, boolean>;
  redeemedOffers: Record<string, boolean>;
  registeredEvents: Record<string, boolean>;
  onBack: () => void;
  onToggleFav: (id: string, e?: React.MouseEvent) => void;
  onToggleFollow: (id: string) => void;
  onRedeem: (id: string, title: string) => void;
  onJoinEvent: (eventId: string, title: string) => void;
  onCollectReward: (businessId: string, title: string, cost: number) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const DiscoverBusinessProfile: React.FC<DiscoverBusinessProfileProps> = ({
  businessId, points, favorites, followedBusinesses, redeemedOffers, registeredEvents,
  onBack, onToggleFav, onToggleFollow, onRedeem, onJoinEvent, onCollectReward, showToast,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('storefront');
  const [biz, setBiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { data: eventsData } = useDiscoverEvents({ tab: 'upcoming', limit: 5 });
  const { data: rewardsData } = useDiscoverRewards({ tab: 'available', limit: 5 });

  const events = eventsData?.items || [];
  const rewards = rewardsData?.items || [];

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await api.get(`/listings/${businessId}`);
        setBiz(response.data);
      } catch (err) {
        console.error('Failed to fetch business:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [businessId]);

  const isFav = favorites[businessId];
  const isFollowing = followedBusinesses[businessId];
  const isRedeemed = redeemedOffers[businessId];

  if (loading) {
    return (
      <div className="animate-in fade-in duration-300 space-y-6 pb-20">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!biz) return null;

  return (
    <div className="animate-in fade-in duration-300 space-y-6 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 shadow-sm border border-[#e2bfb0]/30">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-[#ffeae1] rounded-xl transition-all active:scale-90">
            <ArrowLeft className="w-4 h-4 text-[#a14000]" />
          </button>
          <div>
            <p className="text-[10px] text-[#5a4136] uppercase tracking-wider font-semibold">Business Profile</p>
            <h1 className="text-lg font-bold text-[#261812]">{biz.businessName || biz.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => onToggleFav(businessId, e)}
            className={`p-2 rounded-xl transition-all active:scale-90 ${isFav ? 'text-red-500' : 'text-[#8e7164] hover:text-red-500'}`}>
            <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500' : ''}`} />
          </button>
          <button onClick={() => showToast('Share link copied!', 'info')} className="p-2 rounded-xl text-[#8e7164] hover:text-[#a14000] transition-all active:scale-90">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-48 w-full rounded-2xl overflow-hidden shadow-sm group">
        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={biz.businessName || biz.name} src={biz.heroImage || biz.bannerUrl || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600'} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5 text-white">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="bg-amber-500 text-white px-3 py-0.5 rounded-full text-[9px] font-bold uppercase">{biz.statusTag || 'OPEN'}</span>
            <div className="flex items-center px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-sm">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
              <span className="text-[10px] font-bold">{biz.rating || biz.averageRating || '4.8'}</span>
            </div>
          </div>
          <p className="text-white/80 text-xs font-medium">{biz.category || biz.sector?.name || 'Business'} · {biz.distance || ''} · {biz.borough || 'Manhattan'}</p>
        </div>
      </section>

      {/* Main Action Buttons */}
      <section className="grid grid-cols-4 gap-3">
        <button onClick={() => onToggleFollow(businessId)}
          className={`flex flex-col items-center justify-center bg-white p-3 rounded-2xl border shadow-sm active:scale-95 transition-all ${isFollowing ? 'border-[#a14000] bg-[#fff1ec]' : 'border-[#e2bfb0]/30'}`}>
          <UserPlus className={`w-5 h-5 mb-1 ${isFollowing ? 'text-[#a14000]' : 'text-[#5a4136]'}`} />
          <span className="text-[9px] font-bold text-[#261812]">{isFollowing ? 'Following' : 'Follow'}</span>
        </button>
        <button onClick={() => showToast('Opening contact options...', 'info')}
          className="flex flex-col items-center justify-center bg-white p-3 rounded-2xl border border-[#e2bfb0]/30 shadow-sm active:scale-95 transition-all">
          <Phone className="w-5 h-5 mb-1 text-[#5a4136]" />
          <span className="text-[9px] font-bold text-[#261812]">Contact</span>
        </button>
        <button onClick={() => onRedeem(businessId, biz.flashSaleTitle)}
          className="flex flex-col items-center justify-center bg-white p-3 rounded-2xl border border-[#e2bfb0]/30 shadow-sm active:scale-95 transition-all">
          <Gift className="w-5 h-5 mb-1 text-[#5a4136]" />
          <span className="text-[9px] font-bold text-[#261812]">Redeem</span>
        </button>
        <button onClick={() => showToast('Booking service...', 'info')}
          className="flex flex-col items-center justify-center bg-white p-3 rounded-2xl border border-[#e2bfb0]/30 shadow-sm active:scale-95 transition-all">
          <Calendar className="w-5 h-5 mb-1 text-[#5a4136]" />
          <span className="text-[9px] font-bold text-[#261812]">Book</span>
        </button>
      </section>

      {/* Quick Info */}
      <section className="bg-white rounded-2xl p-5 border border-[#e2bfb0]/30 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#a14000]" />
            <div>
              <p className="text-[9px] text-[#5a4136] font-semibold">Location</p>
              <p className="text-xs font-bold text-[#261812]">Manhattan Central</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#a14000]" />
            <div>
              <p className="text-[9px] text-[#5a4136] font-semibold">Hours</p>
              <p className="text-xs font-bold text-[#261812]">9:00 AM - 9:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-[#a14000]" />
            <div>
              <p className="text-[9px] text-[#5a4136] font-semibold">Phone</p>
              <p className="text-xs font-bold text-[#261812]">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-[#a14000]" />
            <div>
              <p className="text-[9px] text-[#5a4136] font-semibold">Email</p>
              <p className="text-xs font-bold text-[#261812] truncate">hello@{biz.name.toLowerCase().replace(/\s+/g, '')}.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress */}
      <section className="bg-white rounded-2xl p-5 border border-[#e2bfb0]/30 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#261812]">Your Progress</h3>
            <p className="text-[10px] text-[#5a4136] uppercase font-semibold">{biz.tierName}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-[#a14000] font-bold text-lg">
              <Sparkles className="w-4 h-4 fill-[#a14000]" />
              <span>{points}</span>
            </div>
            <p className="text-[8px] font-bold text-[#5a4136] uppercase tracking-widest">Points</p>
          </div>
        </div>
        <div className="w-full bg-[#ff9969]/20 h-2.5 rounded-full overflow-hidden">
          <div className="h-full bg-[#a14000] rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (points / biz.nextTierPoints) * 100)}%` }} />
        </div>
        <div className="flex justify-between items-center text-xs text-[#5a4136] mt-2">
          <span>{Math.max(0, biz.nextTierPoints - points)} pts to next tier</span>
          <span className="text-[#a14000] flex items-center gap-1 font-semibold">
            <Award className="w-3.5 h-3.5" />
            Reward unlocked
          </span>
        </div>
      </section>

      {/* Profile Tabs */}
      <section className="bg-white rounded-2xl border border-[#e2bfb0]/30 overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar border-b border-[#e2bfb0]/30">
          {PROFILE_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold transition-all ${
                  isActive ? 'text-[#a14000] border-b-2 border-[#a14000] bg-[#fff1ec]' : 'text-[#5a4136] hover:bg-[#fff8f6]'
                }`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {activeTab === 'storefront' && <StorefrontTab biz={biz} />}
          {activeTab === 'promotions' && <PromotionsTab biz={biz} isRedeemed={isRedeemed} onRedeem={() => onRedeem(businessId, biz.flashSaleTitle)} />}
          {activeTab === 'events' && <EventsTab biz={biz} businessId={businessId} registeredEvents={registeredEvents} onJoinEvent={onJoinEvent} />}
          {activeTab === 'rewards' && <RewardsTab biz={biz} businessId={businessId} points={points} onCollectReward={onCollectReward} showToast={showToast} />}
          {activeTab === 'reviews' && <ReviewsTab />}
          {activeTab === 'about' && <AboutTab biz={biz} />}
        </div>
      </section>
    </div>
  );
};

/* ===== TAB CONTENT COMPONENTS ===== */

function StorefrontTab({ biz }: { biz: any }) {
  return (
    <div className="space-y-5">
      {/* Hero & Featured Offers */}
      <div className="relative h-44 rounded-2xl overflow-hidden">
        <img className="w-full h-full object-cover" alt={biz.name} src={biz.heroImage} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-4 text-white">
          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Featured Offer</span>
          <h4 className="text-lg font-extrabold">{biz.flashSaleTitle}</h4>
        </div>
      </div>

      {/* Gamification */}
      <div className="bg-[#fff1ec] rounded-2xl p-5 border border-[#e2bfb0]/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#ff9969]/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#a14000]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#261812]">Gamification</h4>
            <p className="text-[10px] text-[#5a4136]">Visit 3 more times to unlock Gold status</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold ${i <= 2 ? 'bg-amber-400 text-amber-900' : 'bg-[#f8ddd2] text-[#8e7164]'}`}>
                {i <= 2 ? <Star className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-bold text-[#a14000]">2/5 visits</span>
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <h4 className="text-sm font-bold text-[#261812] mb-3">Featured Products</h4>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#e2bfb0]/30 shadow-sm">
              <div className="h-24 bg-[#f8ddd2] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-[#8e7164]" />
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-[#261812]">Product {i}</p>
                <p className="text-[9px] text-[#5a4136]">$19.99</p>
                {i % 2 === 0 && <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full mt-1 inline-block">Reward eligible</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Campaigns */}
      <div className="bg-gradient-to-r from-[#a14000] to-[#ff6900] text-white rounded-2xl p-5">
        <h4 className="text-sm font-bold mb-2">Live Campaigns</h4>
        <p className="text-xs text-orange-100 mb-3">Active borough campaign: Double points on all purchases today!</p>
        <button className="px-4 py-2 bg-white text-[#a14000] rounded-xl text-[10px] font-bold active:scale-95 transition-all">Join Campaign</button>
      </div>

      {/* Event Highlights */}
      {biz.events.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-[#261812] mb-3">Event Highlights</h4>
          {biz.events.map((ev: any, i: number) => (
            <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#e2bfb0]/30">
              <div className="w-14 h-14 rounded-xl bg-[#ff9969]/20 flex flex-col items-center justify-center text-[#a14000] shrink-0">
                <span className="text-[8px] font-black uppercase">{ev.date}</span>
                <span className="text-lg font-black leading-none">{ev.day}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#261812]">{ev.title}</p>
                <p className="text-[10px] text-[#5a4136]">{ev.desc} · {ev.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PromotionsTab({ biz, isRedeemed, onRedeem }: { biz: any; isRedeemed: boolean; onRedeem: () => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#fff1ec] rounded-2xl p-5 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[9px] font-bold text-[#a14000] uppercase tracking-wider">Flash Deal</span>
          <h4 className="text-lg font-extrabold text-[#261812] mt-1">{biz.flashSaleTitle}</h4>
          <p className="text-xs text-[#5a4136] mt-1">{biz.flashSaleDesc}</p>
          <button onClick={onRedeem} disabled={isRedeemed}
            className={`mt-4 px-6 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all ${isRedeemed ? 'bg-emerald-100 text-emerald-700' : 'bg-[#a14000] text-white shadow-md'}`}>
            {isRedeemed ? 'Redeemed ✓' : 'Redeem Offer'}
          </button>
        </div>
        <Zap className="absolute -right-4 -bottom-4 w-20 h-20 text-[#ff9969] opacity-30" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {['Loyalty Bonus', 'Seasonal Campaign', 'Borough Campaign', 'QR Promotion'].map((p, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-[#e2bfb0]/30 text-center">
            <Gift className="w-6 h-6 text-[#a14000] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#261812]">{p}</p>
            <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-2 inline-block">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsTab({ biz, businessId, registeredEvents, onJoinEvent }: {
  biz: any; businessId: string;
  registeredEvents: Record<string, boolean>; onJoinEvent: (eventId: string, title: string) => void;
}) {
  return (
    <div className="space-y-4">
      {biz.events.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-[#e2bfb0]/30">
          <Calendar className="w-8 h-8 text-[#8e7164] mx-auto mb-2" />
          <p className="text-xs font-bold text-[#5a4136]">No Upcoming Events</p>
          <p className="text-[10px] text-[#8e7164] mt-1">Check back for new events</p>
        </div>
      ) : (
        biz.events.map((ev: any, i: number) => {
          const regKey = `${businessId}-event-${i}`;
          const isRegistered = registeredEvents[regKey];
          return (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#e2bfb0]/30 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#ff9969]/20 flex flex-col items-center justify-center text-[#a14000] shrink-0">
                  <span className="text-[8px] font-black uppercase">{ev.date}</span>
                  <span className="text-xl font-black leading-none">{ev.day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#261812]">{ev.title}</h4>
                  <p className="text-[10px] text-[#5a4136]">{ev.desc}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] text-[#8e7164] flex items-center gap-1"><Clock className="w-3 h-3" /> {ev.time}</span>
                    <span className="text-[9px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Users className="w-3 h-3" /> {Math.floor(Math.random() * 50) + 10} spots</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#e2bfb0]/30 flex items-center justify-between">
                <span className="text-[9px] text-amber-600 font-semibold flex items-center gap-1"><Award className="w-3 h-3" /> +50 pts reward</span>
                <button onClick={() => onJoinEvent(regKey, ev.title)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-bold active:scale-95 transition-all ${isRegistered ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-[#a14000] text-white shadow-sm'}`}>
                  {isRegistered ? 'Joined ✓' : 'Join Event'}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function RewardsTab({ biz, businessId, points, onCollectReward, showToast }: {
  biz: any; businessId: string; points: number;
  onCollectReward: (businessId: string, title: string, cost: number) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-5">
        <Award className="w-8 h-8 mb-2" />
        <h4 className="text-base font-extrabold">Tier Rewards</h4>
        <p className="text-xs text-amber-100 mt-1">Redeem your points for exclusive rewards</p>
      </div>
      {biz.rewards.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-[#e2bfb0]/30">
          <Award className="w-8 h-8 text-[#8e7164] mx-auto mb-2" />
          <p className="text-xs font-bold text-[#5a4136]">No Rewards Available</p>
          <p className="text-[10px] text-[#8e7164] mt-1">Check back for new rewards</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {biz.rewards.map((reward: any, i: number) => (
            <div key={i} className="relative rounded-2xl overflow-hidden shadow-sm aspect-[4/3] group border border-[#e2bfb0]/30">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={reward.title} src={reward.image} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                <div className="flex items-center justify-between mb-1">
                  <span className={`${reward.tagColor} text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase`}>{reward.tag}</span>
                  <span className="text-amber-400 font-bold text-xs">{reward.cost} pts</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-white text-sm font-bold truncate">{reward.title}</h4>
                  <button onClick={() => {
                    if (points < reward.cost) { showToast(`Need ${reward.cost} pts`, 'error'); return; }
                    onCollectReward(businessId, reward.title, reward.cost);
                  }} className="bg-white text-[#a14000] text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all shrink-0">
                    Collect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="bg-[#fff1ec] rounded-2xl p-5 border border-[#e2bfb0]/30">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-[#a14000]" />
          <h4 className="text-sm font-bold text-[#261812]">Loyalty Bonuses</h4>
        </div>
        <p className="text-xs text-[#5a4136] mb-3">Earn bonus points with every 5th visit. Current streak: 3 visits</p>
        <div className="w-full bg-[#ff9969]/20 h-2 rounded-full overflow-hidden">
          <div className="w-[60%] h-full bg-[#a14000] rounded-full" />
        </div>
        <p className="text-[10px] text-[#5a4136] mt-2 font-semibold">2 more visits until next bonus</p>
      </div>
    </div>
  );
}

function ReviewsTab() {
  const [showAll, setShowAll] = useState(false);
  const reviews = showAll ? MOCK_REVIEWS : MOCK_REVIEWS.slice(0, 2);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#261812]">Customer Reviews</h4>
        <span className="text-[10px] font-bold text-[#5a4136]">4.7 avg · 840 reviews</span>
      </div>
      {reviews.map(r => (
        <div key={r.id} className="bg-white rounded-2xl p-4 border border-[#e2bfb0]/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f8ddd2] flex items-center justify-center text-[10px] font-bold text-[#a14000]">{r.avatar}</div>
              <span className="text-xs font-bold text-[#261812]">{r.user}</span>
            </div>
            <span className="text-[9px] text-[#5a4136]">{r.date}</span>
          </div>
          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className={`w-3 h-3 ${i <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-[#e2bfb0]'}`} />
            ))}
          </div>
          <p className="text-xs text-[#5a4136] leading-relaxed">{r.text}</p>
        </div>
      ))}
      <div className="flex gap-3">
        {!showAll && MOCK_REVIEWS.length > 2 && (
          <button onClick={() => setShowAll(true)} className="flex-1 py-2.5 border border-[#e2bfb0]/30 rounded-xl text-[10px] font-bold text-[#5a4136] hover:bg-[#fff1ec] transition-all">View All Reviews</button>
        )}
        <button className="flex-1 py-2.5 bg-[#a14000] text-white rounded-xl text-[10px] font-bold active:scale-95 transition-all">Write a Review</button>
      </div>
    </div>
  );
}

function AboutTab({ biz }: { biz: any }) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-bold text-[#261812] mb-2">About {biz.name}</h4>
        <p className="text-xs text-[#5a4136] leading-relaxed">
          {biz.name} is a premier {biz.category.toLowerCase()} destination located in Manhattan Central. 
          We are committed to providing exceptional service and quality products to our local community. 
          Join our rewards program to earn points and unlock exclusive benefits.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#fff1ec] rounded-2xl p-4">
          <MapPin className="w-5 h-5 text-[#a14000] mb-2" />
          <p className="text-[10px] text-[#5a4136] font-semibold">Location</p>
          <p className="text-xs font-bold text-[#261812]">Manhattan Central Borough</p>
        </div>
        <div className="bg-[#fff1ec] rounded-2xl p-4">
          <Store className="w-5 h-5 text-[#a14000] mb-2" />
          <p className="text-[10px] text-[#5a4136] font-semibold">High Street</p>
          <p className="text-xs font-bold text-[#261812]">Peckham High Street</p>
        </div>
        <div className="bg-[#fff1ec] rounded-2xl p-4">
          <Clock className="w-5 h-5 text-[#a14000] mb-2" />
          <p className="text-[10px] text-[#5a4136] font-semibold">Opening Hours</p>
          <div className="text-[10px] font-bold text-[#261812] space-y-0.5">
            <p>Mon-Fri: 9:00 AM - 9:00 PM</p>
            <p>Sat: 10:00 AM - 8:00 PM</p>
            <p>Sun: 11:00 AM - 6:00 PM</p>
          </div>
        </div>
        <div className="bg-[#fff1ec] rounded-2xl p-4">
          <Phone className="w-5 h-5 text-[#a14000] mb-2" />
          <p className="text-[10px] text-[#5a4136] font-semibold">Contact</p>
          <p className="text-[10px] font-bold text-[#261812]">+1 (555) 123-4567</p>
          <p className="text-[9px] text-[#a14000]">hello@{biz.name.toLowerCase().replace(/\s+/g, '')}.com</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="flex-1 py-2.5 bg-[#a14000] text-white rounded-xl text-[10px] font-bold active:scale-95 transition-all flex items-center justify-center gap-1">
          <Phone className="w-3.5 h-3.5" /> Call
        </button>
        <button className="flex-1 py-2.5 border border-[#e2bfb0]/30 rounded-xl text-[10px] font-bold text-[#5a4136] flex items-center justify-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" /> Message
        </button>
        <button className="flex-1 py-2.5 border border-[#e2bfb0]/30 rounded-xl text-[10px] font-bold text-[#5a4136] flex items-center justify-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> Directions
        </button>
      </div>
    </div>
  );
}

export default DiscoverBusinessProfile;
