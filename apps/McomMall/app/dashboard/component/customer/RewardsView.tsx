'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Star,
  ChevronRight,
  Clock,
  ArrowLeft,
  Heart,
  Share2,
  Lock,
  Check,
  Trophy,
  Coffee,
  Ticket,
  Zap,
  Bookmark,
  Info,
  MapPin,
  History,
  X,
  Sparkles,
  ShoppingBag,
  Shirt,
  Utensils,
  Gift,
  QrCode,
  BadgeCheck,
  Wallet,
  PartyPopper,
  Diamond,
  KeyRound,
  Send,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { RootState } from '@/service/store/store';
import { useCustomerPoints } from '@/context/CustomerPointsContext';
import { useDiscoverRewards } from '@/hooks/useDiscover';
import api from '@/service/api';

type RewardsTab = 'my-points' | 'available' | 'redeemed' | 'loyalty' | 'expiring';
type SubView = 'dashboard' | 'details';
type RewardType = 'coupon' | 'voucher' | 'qr' | 'event' | 'gift' | 'loyalty' | 'gamification' | 'code';

interface RewardDetails {
  id: string;
  title: string;
  description: string;
  cost: number;
  image: string;
  type?: RewardType;
  businessName?: string;
  expiryText: string;
  tier?: string;
  brand?: string;
  code?: string;
  isUrgent?: boolean;
  isHot?: boolean;
  isLocked?: boolean;
  badgeIcon?: string;
  rewardType?: string;
  redeemedDate?: string;
  redeemedTime?: string;
  category?: string;
  usageCondition?: string;
  isOptedIn?: boolean;
  longDescription?: string;
  progress?: number;
  accumulationRules?: string[];
  benefits?: string[];
  [key: string]: any;
}

interface RewardHistoryEntry {
  id: string;
  title: string;
  date: string;
  points: number;
  type: string;
  iconBg?: string;
  icon?: string;
  subtitle?: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

function getRewardIcon(icon: string, className = 'w-5 h-5') {
  const cnIcon = cn(className);
  switch (icon) {
    case 'workspace_premium': return <Trophy className={cn('text-amber-600', cnIcon)} />;
    case 'confirmation_number': return <Ticket className={cn('text-indigo-500', cnIcon)} />;
    case 'flash_on': return <Zap className={cn('text-orange-500', cnIcon)} />;
    case 'checkroom': return <Shirt className={cn('text-[#a23f00]', cnIcon)} />;
    case 'casino': return <Gift className={cn('text-[#00629f]', cnIcon)} />;
    case 'restaurant': return <Utensils className={cn('text-[#97471d]', cnIcon)} />;
    case 'shopping_bag': return <ShoppingBag className={cn('text-[#97471d]', cnIcon)} />;
    case 'celebration': return <PartyPopper className={cn('text-purple-500', cnIcon)} />;
    case 'diamond': return <Diamond className={cn('text-cyan-500', cnIcon)} />;
    case 'key': return <KeyRound className={cn('text-emerald-600', cnIcon)} />;
    default: return <Coffee className={cn('text-amber-600', cnIcon)} />;
  }
}

function getTabIcon(tab: RewardsTab, className = 'w-5 h-5') {
  const cnIcon = cn(className);
  switch (tab) {
    case 'my-points': return <Wallet className={cnIcon} />;
    case 'available': return <Gift className={cnIcon} />;
    case 'redeemed': return <History className={cnIcon} />;
    case 'loyalty': return <BadgeCheck className={cnIcon} />;
    case 'expiring': return <Clock className={cnIcon} />;
  }
}

function PointsBreakdownWidget({ earned, used, pending }: { earned: number; used: number; pending: number }) {
  const total = earned + pending;
  const usedPct = total > 0 ? Math.round((used / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const earnedPct = 100 - usedPct - pendingPct;
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#e2bfb0]/30 shadow-sm space-y-3">
      <p className="text-[10px] font-bold text-[#5a4136] uppercase tracking-wider">Points Breakdown</p>
      <div className="h-2 w-full bg-[#f8ddd2] rounded-full overflow-hidden flex">
        <div className="bg-[#a23f00] h-full transition-all" style={{ width: `${Math.max(earnedPct, 5)}%` }} title={`Earned: ${earned}`} />
        <div className="bg-[#5a4136] h-full transition-all" style={{ width: `${Math.max(usedPct < 1 ? 0 : usedPct, usedPct > 0 ? 3 : 0)}%` }} title={`Used: ${used}`} />
        <div className="bg-amber-400 h-full transition-all" style={{ width: `${Math.max(pendingPct < 1 ? 0 : pendingPct, pendingPct > 0 ? 3 : 0)}%` }} title={`Pending: ${pending}`} />
      </div>
      <div className="flex flex-wrap gap-3 text-[10px] font-medium">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#a23f00]" /> Earned: <strong>{earned.toLocaleString()}</strong></span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#5a4136]" /> Used: <strong>{used.toLocaleString()}</strong></span>
        {pending > 0 && (
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Pending: <strong>{pending.toLocaleString()}</strong></span>
        )}
      </div>
    </div>
  );
}

function ExpiryAlertWidget({ rewards }: { rewards: RewardDetails[] }) {
  if (rewards.length === 0) return null;
  const top = rewards.slice(0, 2);
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#ba1a1a]/20 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-[#ba1a1a] uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Expiring Soon
        </p>
        <span className="text-[10px] font-bold text-[#5a4136]">{rewards.length} reward{rewards.length > 1 ? 's' : ''}</span>
      </div>
      {top.map(r => (
        <div key={r.id} className="flex items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-[#ba1a1a] shrink-0" />
            <span className="text-xs font-semibold text-[#261812] truncate">{r.title}</span>
          </div>
          <span className="text-[9px] font-bold text-[#ba1a1a] shrink-0">{r.expiryText}</span>
        </div>
      ))}
    </div>
  );
}

const REWARD_TYPE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  coupon: { label: 'Coupon', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  voucher: { label: 'Voucher', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  qr: { label: 'QR Reward', bg: 'bg-amber-100', text: 'text-amber-700' },
  event: { label: 'Event', bg: 'bg-purple-100', text: 'text-purple-700' },
  gift: { label: 'Gift', bg: 'bg-rose-100', text: 'text-rose-700' },
  loyalty: { label: 'Loyalty', bg: 'bg-orange-100', text: 'text-orange-700' },
  gamification: { label: 'Challenge', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  code: { label: 'Code', bg: 'bg-sky-100', text: 'text-sky-700' },
};

function RewardTypeBadge({ type }: { type: RewardType | string }) {
  const cfg = REWARD_TYPE_LABELS[type];
  if (!cfg) return null;
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider', cfg.bg, cfg.text)}>
      {cfg.label}
    </span>
  );
}

const TABS: { id: RewardsTab; label: string }[] = [
  { id: 'my-points', label: 'My Points' },
  { id: 'available', label: 'Available' },
  { id: 'redeemed', label: 'Redeemed' },
  { id: 'loyalty', label: 'Loyalty' },
  { id: 'expiring', label: 'Expiring' },
];

export const RewardsView: React.FC = () => {
  const { userName } = useSelector((state: RootState) => state.auth);
  const { points, addPoints, redeemPoints, isLoading } = useCustomerPoints();

  const [subView, setSubView] = useState<SubView>('dashboard');
  const [activeTab, setActiveTab] = useState<RewardsTab>('my-points');
  const [selectedRewardId, setSelectedRewardId] = useState<string>('coffee-duo');
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [redeemedIds, setRedeemedIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<RewardDetails | null>(null);

  const { data: apiRewards, loading: rewardsLoading } = useDiscoverRewards({
    tab: activeTab,
    limit: 20,
  });

  // Create rewards lookup map from API data
  const REWARDS_MOCK_DATA: Record<string, RewardDetails> = React.useMemo(() => {
    const data: Record<string, RewardDetails> = {};
    if (apiRewards && Array.isArray(apiRewards)) {
      apiRewards.forEach((r: any) => {
        data[r.id] = {
          id: r.id,
          title: r.title || 'Reward',
          description: r.description || '',
          cost: r.cost || 0,
          image: r.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600',
          type: 'loyalty',
          businessName: r.businessName || r.brand || 'Business',
          expiryText: r.expiryText || 'Limited time',
          brand: r.brand,
          category: r.category,
          tier: r.tier,
        };
      });
    }
    return data;
  }, [apiRewards]);

  const [pointsBreakdown, setPointsBreakdown] = useState({ earned: 0, used: 0, pending: 0 });
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [loyaltyMemberships, setLoyaltyMemberships] = useState<any[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<any[]>([]);
  const [expiringRewards, setExpiringRewards] = useState<any[]>([]);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const walletRes = await api.get('/wallet');
        if (walletRes.data) {
          setPointsBreakdown({
            earned: walletRes.data.balance || 0,
            used: walletRes.data.totalRedeemed || 0,
            pending: walletRes.data.pendingPoints || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch wallet:', err);
      }
    };

    const fetchMembershipData = async () => {
      try {
        const membershipRes = await api.get('/membership/my');
        if (membershipRes.data && Array.isArray(membershipRes.data)) {
          setLoyaltyMemberships(membershipRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch memberships:', err);
      }
    };

    fetchWalletData();
    fetchMembershipData();
  }, []);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const handleNavigateToDetails = useCallback((id: string) => {
    setSelectedRewardId(id);
    setSubView('details');
  }, []);

  const toggleFavorite = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const isFav = !prev[id];
      showToast(isFav ? 'Added to saved rewards!' : 'Removed from saved rewards!', 'info');
      return { ...prev, [id]: isFav };
    });
  }, [showToast]);

  const handleClaim = useCallback((reward: RewardDetails) => {
    if (claimedIds.includes(reward.id)) {
      showToast('Already claimed! Check your active rewards.', 'info');
      return;
    }
    if (points < reward.cost) {
      showToast(`Insufficient points! Need ${reward.cost} pts.`, 'error');
      return;
    }
    if (redeemPoints(reward.cost)) {
      setClaimedIds(prev => [...prev, reward.id]);
      showToast(`"${reward.title}" redeemed for ${reward.cost} pts!`, 'success');
    }
  }, [claimedIds, points, redeemPoints, showToast]);

  const handleMarkAsScanned = useCallback((id: string) => {
    if (redeemedIds.includes(id)) return;
    setRedeemedIds(prev => [...prev, id]);
    setClaimedIds(prev => prev.filter(i => i !== id));
    const reward = REWARDS_MOCK_DATA[id];
    if (reward) setScanConfirm(reward);
    showToast('Reward used at counter!', 'success');
  }, [redeemedIds, showToast]);

  const getExpiringSorted = useCallback((rewards: RewardDetails[]): RewardDetails[] => {
    const urgencyOrder: Record<string, number> = { 'true': 0, 'false': 1 };
    return [...rewards].sort((a, b) => {
      const aScore = urgencyOrder[String(!!a.isUrgent)] ?? 1;
      const bScore = urgencyOrder[String(!!b.isUrgent)] ?? 1;
      if (aScore !== bScore) return aScore - bScore;
      const aMatch = a.expiryText.match(/(\d+)\s*(hour|day)/i) ?? a.expiryText.match(/Exp\.?\s+in\s+(\d+)\s*(hour|day)/i);
      const bMatch = b.expiryText.match(/(\d+)\s*(hour|day)/i) ?? b.expiryText.match(/Exp\.?\s+in\s+(\d+)\s*(hour|day)/i);
      if (aMatch && bMatch) {
        const aUnit = aMatch[2].toLowerCase();
        const bUnit = bMatch[2].toLowerCase();
        const aNum = parseInt(aMatch[1]) * (aUnit === 'hour' ? 1 : aUnit === 'day' ? 24 : 1);
        const bNum = parseInt(bMatch[1]) * (bUnit === 'hour' ? 1 : bUnit === 'day' ? 24 : 1);
        return aNum - bNum;
      }
      if (aMatch) return -1;
      if (bMatch) return 1;
      return 0;
    });
  }, []);

  const getFilteredRewards = useCallback((): RewardDetails[] => {
    const all = Object.values(REWARDS_MOCK_DATA);
    switch (activeTab) {
      case 'available': return all.filter(r => !claimedIds.includes(r.id) && !redeemedIds.includes(r.id));
      case 'my-points': return [];
      case 'redeemed': return redeemedRewards;
      case 'loyalty': return loyaltyMemberships;
      case 'expiring': return getExpiringSorted(expiringRewards);
    }
  }, [activeTab, claimedIds, redeemedIds, getExpiringSorted]);

  const selectedReward = REWARDS_MOCK_DATA[selectedRewardId]
    ?? REWARDS_MOCK_DATA['coffee-duo'];

  const isSelectedClaimed = claimedIds.includes(selectedReward.id);
  const isSelectedRedeemed = redeemedIds.includes(selectedReward.id);

  const [codeInput, setCodeInput] = useState('');
  const [codeResult, setCodeResult] = useState<{ success: boolean; message: string } | null>(null);
  const [scanConfirm, setScanConfirm] = useState<RewardDetails | null>(null);
  const urgentExpiringCount = getExpiringSorted(expiringRewards).filter(r => r.isUrgent).length;

  return (
    <div className="min-h-screen text-[#261812] bg-[#fff8f6] antialiased relative">
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="animate-pulse space-y-5 p-5">
          <div className="h-10 w-40 bg-[#f8ddd2] rounded-xl" />
          <div className="h-48 bg-[#f8ddd2] rounded-[32px]" />
          <div className="h-16 bg-[#f8ddd2] rounded-xl" />
          <div className="h-96 bg-[#f8ddd2] rounded-2xl" />
        </div>
      )}

      {!isLoading && (
      <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={cn(
            'px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-bold backdrop-blur-sm',
            toast.type === 'success' && 'bg-emerald-50 text-emerald-700 border-emerald-100',
            toast.type === 'error' && 'bg-rose-50 text-rose-700 border-rose-100',
            toast.type === 'info' && 'bg-indigo-50 text-indigo-700 border-indigo-100',
          )}>
            <Sparkles className={cn(
              'w-4 h-4',
              toast.type === 'success' && 'text-emerald-500',
              toast.type === 'error' && 'text-rose-500',
              toast.type === 'info' && 'text-indigo-500',
            )} />
            {toast.message}
          </div>
        </div>
      )}

      {/* ===== DASHBOARD VIEW ===== */}
      {subView === 'dashboard' && (
        <div className="animate-in fade-in duration-300">
          {/* --- Top Navigation Bar --- */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#ff6904] bg-[#f8ddd2] flex items-center justify-center font-bold text-[#a23f00] text-sm shrink-0">
                {userName?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5a4136] uppercase tracking-wider block leading-tight">
                  Rewards
                </span>
                <span className="text-sm font-extrabold text-[#a23f00] leading-none">
                  MCOM Mall
                </span>
              </div>
            </div>
            <button
              onClick={() => showToast(urgentExpiringCount > 0 ? `${urgentExpiringCount} reward${urgentExpiringCount > 1 ? 's' : ''} expiring soon!` : 'No new notifications', urgentExpiringCount > 0 ? 'error' : 'info')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#ffeae1] transition-all active:scale-95 relative"
            >
              <Sparkles className="w-5 h-5 text-[#a23f00]" />
              {urgentExpiringCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] text-white text-[7px] font-black rounded-full flex items-center justify-center">
                  {urgentExpiringCount}
                </span>
              )}
            </button>
          </div>

          {/* --- Balance Card --- */}
          <section className="mb-5">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#a23f00] via-[#ff6904] to-[#ff9969] p-6 text-white shadow-[0px_10px_30px_rgba(252,103,0,0.12)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                  Total Balance
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-[40px] font-extrabold leading-none">
                    {points.toLocaleString()}
                  </span>
                  <span className="text-base font-semibold opacity-80">pts</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-lg font-bold">{Object.values(REWARDS_MOCK_DATA).filter(r => !claimedIds.includes(r.id) && !redeemedIds.includes(r.id)).length}</span>
                    <p className="text-[10px] font-medium opacity-80">Available</p>
                  </div>
                  <div className="border-l border-white/20 pl-4">
                    <span className="text-lg font-bold">{loyaltyMemberships.length}</span>
                    <p className="text-[10px] font-medium opacity-80">Loyalty</p>
                  </div>
                  <div className="border-l border-white/20 pl-4">
                    <span className="text-lg font-bold">{expiringRewards.length + Object.values(REWARDS_MOCK_DATA).filter(r => r.cost <= points && !claimedIds.includes(r.id) && !redeemedIds.includes(r.id)).length}</span>
                    <p className="text-[10px] font-medium opacity-80">Redeemable</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* --- Points Breakdown --- */}
          <section className="mb-5">
            <PointsBreakdownWidget
              earned={pointsBreakdown.earned}
              used={pointsBreakdown.used}
              pending={pointsBreakdown.pending}
            />
          </section>

          {/* --- Expiry Alerts --- */}
          <section className="mb-5">
            <ExpiryAlertWidget rewards={getExpiringSorted(expiringRewards)} />
          </section>

          {/* --- Snapshot Widget --- */}
          <section className="mb-5">
            <div className="bg-white rounded-xl p-4 flex items-center justify-between border border-[#e2bfb0]/30 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ff9969]/20 flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-[#97471d]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#5a4136] uppercase tracking-wider">
                    Reward Activity Snapshot
                  </p>
                  <p className="text-sm font-semibold text-[#261812]">
                    Earned +50 pts at Artisan Brew
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8e7164] shrink-0" />
            </div>
          </section>

          {/* --- Tabs --- */}
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 no-scrollbar sticky top-0 bg-[#fff8f6] z-30">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
                  activeTab === tab.id
                    ? 'bg-[#a23f00] text-white shadow-sm'
                    : 'bg-[#ffeae1] text-[#5a4136] hover:bg-[#f8ddd2]',
                )}
              >
                {getTabIcon(tab.id, 'w-4 h-4')}
                {tab.label}
              </button>
            ))}
          </div>

          {/* --- Tab Content --- */}
          <div className="mt-4 space-y-4">
            {/* MY POINTS */}
            {activeTab === 'my-points' && (
              <>
                {/* Earnings Chart */}
                <div className="bg-white rounded-[24px] p-6 shadow-[0px_4px_20px_rgba(136,115,106,0.08)]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[#261812]">Earnings Growth</h3>
                    <span className="text-[10px] font-bold text-[#00629f] bg-[#cfe4ff] px-2 py-1 rounded-lg">
                      +12% this month
                    </span>
                  </div>
                  <div className="flex items-end justify-between h-32 gap-1 px-1">
                    {[35, 55, 65, 90, 30, 45, 80].map((h, i) => (
                      <div
                        key={i}
                        className="w-full rounded-t-lg transition-all duration-300"
                        style={{
                          height: `${h}%`,
                          backgroundColor: i === 3 ? '#a23f00' : i === 6 ? '#ff6904' : i === 5 ? '#ff9969' : '#f8ddd2',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-medium text-[#8e7164] px-1">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
                    <span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>

                {/* Points History */}
                <div className="space-y-3">
                  <h3 className="font-bold text-[#261812]">Points History</h3>
                  {pointsHistory.map(item => (
                    <HistoryItem key={item.id} item={item} />
                  ))}
                </div>

                {/* Featured Offer */}
                <div className="relative h-48 rounded-[24px] overflow-hidden shadow-lg group">
                  <img
                    alt="Dining Reward"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida/AP1WRLuswlTI_bj5tl9xSpeEYdvOwZ1q92dpOyZX7JGlGBdIqDaCFjMolkirnlamjgRy2ejAj4cw17ARaaXF92sYkG4NR-1LTxSKK3iIR3VdYD2X3bSC6_SdiR1OQA7f-pv9MHHAxhgTqinTZRzuA_kz2AFG_aJa8YMNLZv8rMC7x6C97tVTGC_uS8AvgShNawdC-zhNLPKOhGj4H9YfIrtwILiIrb3NVU82ltPDchgwvip_ex22iYflnP5xUaWk"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                    <p className="text-[10px] font-bold text-[#ffb695] uppercase tracking-widest">
                      Featured Offer
                    </p>
                    <h4 className="text-lg font-bold text-white">50% Off at Urban Grill</h4>
                    <p className="text-sm text-white/80">Redeem 1,500 points now</p>
                  </div>
                </div>
              </>
            )}

            {/* AVAILABLE / REDEEMED / LOYALTY / EXPIRING */}
            {activeTab !== 'my-points' && (
              <RewardGrid
                rewards={getFilteredRewards()}
                activeTab={activeTab}
                claimedIds={claimedIds}
                redeemedIds={redeemedIds}
                favorites={favorites}
                onNavigate={handleNavigateToDetails}
                onClaim={handleClaim}
                onToggleFav={toggleFavorite}
                onMarkScanned={handleMarkAsScanned}
              />
            )}
          </div>

          {/* FAB: History */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="fixed right-5 bottom-24 w-14 h-14 bg-[#a23f00] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-90 transition-all z-40"
          >
            <History className="w-6 h-6" />
          </button>

          {/* ===== CODE INPUT ===== */}
          <div className="fixed bottom-24 left-4 right-20 z-40">
            <div className="bg-white rounded-2xl shadow-xl border border-[#e2bfb0]/30 p-4 flex items-center gap-2 backdrop-blur-sm">
              <input
                type="text"
                value={codeInput}
                onChange={e => setCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter reward code..."
                className="flex-1 px-3 py-2 rounded-xl border border-[#e2bfb0] text-xs font-medium text-[#261812] bg-[#fff8f6] placeholder:text-[#8e7164] focus:outline-none focus:ring-2 focus:ring-[#a23f00]/20 focus:border-[#a23f00] transition-all"
              />
              <button
                onClick={() => {
                  const trimmed = codeInput.trim().toUpperCase();
                  const match = Object.values(REWARDS_MOCK_DATA).find(r => r.code === trimmed);
                  if (match) {
                    setScanConfirm(match);
                    setCodeResult({ success: true, message: `Code redeemed! +${match.cost || 500} pts!` });
                    addPoints(match.cost || 500);
                    setCodeInput('');
                  } else {
                    setCodeResult({ success: false, message: 'Invalid code.' });
                  }
                  window.setTimeout(() => setCodeResult(null), 3000);
                }}
                disabled={!codeInput.trim()}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1',
                  codeInput.trim() ? 'bg-[#a23f00] text-white shadow-sm' : 'bg-[#e2bfb0]/30 text-[#8e7164] cursor-not-allowed',
                )}
              >
                Redeem
              </button>
            </div>
            {codeResult && (
              <div className={cn(
                'mt-2 px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5',
                codeResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200',
              )}>
                {codeResult.success ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                {codeResult.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== DETAILS VIEW ===== */}
      {subView === 'details' && (
        <DetailsView
          reward={selectedReward}
          isClaimed={isSelectedClaimed}
          isRedeemed={isSelectedRedeemed}
          isFavorited={!!favorites[selectedReward.id]}
          onBack={() => setSubView('dashboard')}
          onClaim={() => handleClaim(selectedReward)}
          onMarkScanned={() => handleMarkAsScanned(selectedReward.id)}
          onToggleFav={(e) => toggleFavorite(selectedReward.id, e)}
          onShare={() => showToast('Share link copied!', 'info')}
          onTransfer={() => setTransferTarget(selectedReward)}
        />
      )}

      {/* ===== HISTORY MODAL ===== */}
      {historyOpen && <HistoryModal onClose={() => setHistoryOpen(false)} claimedIds={claimedIds} redeemedIds={redeemedIds} rewards={REWARDS_MOCK_DATA} />}

      {/* ===== TRANSFER MODAL ===== */}
      {transferTarget && (
        <TransferModal
          reward={transferTarget}
          onClose={() => setTransferTarget(null)}
          onTransfer={(recipient) => {
            showToast(`Voucher transferred to ${recipient}!`, 'success');
            setTransferTarget(null);
          }}
        />
      )}

      {/* ===== SCAN CONFIRMATION ===== */}
      {scanConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setScanConfirm(null)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 text-center space-y-5" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="font-extrabold text-[#261812] text-base">Reward Used!</h3>
            <p className="text-sm text-[#5a4136]">
              {scanConfirm.title} has been scanned and marked as used at <strong>{scanConfirm.brand}</strong>.
            </p>
            <p className="text-[10px] text-[#8e7164] font-medium">
              {scanConfirm.redeemedDate || 'Today'} · {scanConfirm.redeemedTime || 'Just now'}
            </p>
            <button
              onClick={() => setScanConfirm(null)}
              className="w-full py-3 bg-[#a23f00] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ===== CODE INPUT ===== */}
      <div className="fixed bottom-24 left-4 right-4 z-40">
        <div className="bg-white rounded-2xl shadow-xl border border-[#e2bfb0]/30 p-4 flex items-center gap-2 backdrop-blur-sm">
          <input
            type="text"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value.toUpperCase())}
            placeholder="Enter reward code..."
            className="flex-1 px-3 py-2 rounded-xl border border-[#e2bfb0] text-xs font-medium text-[#261812] bg-[#fff8f6] placeholder:text-[#8e7164] focus:outline-none focus:ring-2 focus:ring-[#a23f00]/20 focus:border-[#a23f00] transition-all"
          />
          <button
            onClick={() => {
              const trimmed = codeInput.trim().toUpperCase();
              const match = Object.values(REWARDS_MOCK_DATA).find(r => r.code === trimmed);
              if (match) {
                setScanConfirm(match);
                setCodeResult({ success: true, message: `Code redeemed! +${match.cost || 500} pts!` });
                addPoints(match.cost || 500);
                setCodeInput('');
              } else {
                setCodeResult({ success: false, message: 'Invalid code.' });
              }
              window.setTimeout(() => setCodeResult(null), 3000);
            }}
            disabled={!codeInput.trim()}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1',
              codeInput.trim() ? 'bg-[#a23f00] text-white shadow-sm' : 'bg-[#e2bfb0]/30 text-[#8e7164] cursor-not-allowed',
            )}
          >
            Redeem
          </button>
        </div>
        {codeResult && (
          <div className={cn(
            'mt-2 px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5',
            codeResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200',
          )}>
            {codeResult.success ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            {codeResult.message}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

/* ====== SUB-COMPONENTS ====== */

/* History Item */
function HistoryItem({ item }: { item: RewardHistoryEntry }) {
  const isPending = item.type === 'pending';
  return (
    <div className={cn(
      'bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border',
      isPending ? 'border-[#e2bfb0]/30 bg-[#fff8f6]' : 'border-[#e2bfb0]/10',
    )}>
      <div className="flex items-center gap-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center relative', item.iconBg || 'bg-gray-100')}>
          {getRewardIcon(item.icon || 'gift', 'w-6 h-6')}
          {isPending && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-white rounded-full animate-pulse" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#261812]">{item.title}</p>
            {isPending && (
              <span className="text-[8px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Pending
              </span>
            )}
          </div>
          <p className="text-[10px] font-medium text-[#8e7164]">{item.subtitle}</p>
        </div>
      </div>
      <span className={cn(
        'text-base font-bold',
        isPending ? 'text-amber-600' : item.points > 0 ? 'text-[#a23f00]' : item.points < 0 ? 'text-[#5a4136]' : 'text-[#8e7164]',
      )}>
        {item.points > 0 ? '+' : ''}{item.points}
      </span>
    </div>
  );
}

/* Reward Grid */
function RewardGrid({
  rewards,
  activeTab,
  claimedIds,
  redeemedIds,
  favorites,
  onNavigate,
  onClaim,
  onToggleFav,
  onMarkScanned,
}: {
  rewards: RewardDetails[];
  activeTab: RewardsTab;
  claimedIds: string[];
  redeemedIds: string[];
  favorites: Record<string, boolean>;
  onNavigate: (id: string) => void;
  onClaim: (r: RewardDetails) => void;
  onToggleFav: (id: string, e?: React.MouseEvent) => void;
  onMarkScanned: (id: string) => void;
}) {
  if (rewards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-[#f8ddd2] rounded-full flex items-center justify-center mb-4">
          <Gift className="w-10 h-10 text-[#8e7164]" />
        </div>
        <h3 className="font-bold text-[#261812] mb-1">
          {activeTab === 'available' && 'No rewards available'}
          {activeTab === 'redeemed' && 'No redeemed rewards'}
          {activeTab === 'loyalty' && 'No loyalty memberships'}
          {activeTab === 'expiring' && 'No expiring rewards'}
        </h3>
        <p className="text-sm text-[#5a4136] max-w-xs">
          {activeTab === 'available' && 'Check back soon for new rewards.'}
          {activeTab === 'redeemed' && 'Your redeemed rewards will appear here.'}
          {activeTab === 'loyalty' && 'Join loyalty programs to earn more.'}
          {activeTab === 'expiring' && 'No rewards are expiring soon.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rewards.map(reward => {
        const isClaimed = claimedIds.includes(reward.id);
        const isRedeemed = redeemedIds.includes(reward.id);

        if (activeTab === 'expiring') {
          return (
            <ExpiringCard
              key={reward.id}
              reward={reward}
              isFavorited={!!favorites[reward.id]}
              onToggleFav={(e) => onToggleFav(reward.id, e)}
              onRedeem={() => onClaim(reward)}
            />
          );
        }

        if (activeTab === 'loyalty') {
          return <LoyaltyCard key={reward.id} reward={reward} />;
        }

        if (activeTab === 'redeemed') {
          return <RedeemedCard key={reward.id} reward={reward} />;
        }

        return (
          <AvailableCard
            key={reward.id}
            reward={reward}
            isClaimed={isClaimed}
            isRedeemed={isRedeemed}
            isFavorited={!!favorites[reward.id]}
            onClick={() => onNavigate(reward.id)}
            onClaim={(e) => { e.stopPropagation(); onClaim(reward); }}
            onToggleFav={(e) => onToggleFav(reward.id, e)}
            onMarkScanned={(e) => { e.stopPropagation(); onMarkScanned(reward.id); }}
          />
        );
      })}
    </div>
  );
}

/* Available Reward Card */
function AvailableCard({
  reward,
  isClaimed,
  isRedeemed,
  isFavorited,
  onClick,
  onClaim,
  onToggleFav,
  onMarkScanned,
}: {
  reward: RewardDetails;
  isClaimed: boolean;
  isRedeemed: boolean;
  isFavorited: boolean;
  onClick: () => void;
  onClaim: (e: React.MouseEvent) => void;
  onToggleFav: (e: React.MouseEvent) => void;
  onMarkScanned: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-[20px] overflow-hidden shadow-[0px_4px_20px_rgba(136,115,106,0.08)] flex flex-col border border-[#e2bfb0]/30 group hover:shadow-md transition-all cursor-pointer',
        isRedeemed && 'opacity-60 grayscale',
        reward.isHot && 'ring-2 ring-[#ff9969]/50',
      )}
    >
      <div className="h-40 relative bg-[#f8ddd2] shrink-0">
        {reward.image ? (
          <img alt={reward.title} className="w-full h-full object-cover" src={reward.image} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getRewardIcon(reward.badgeIcon || 'gift', 'w-12 h-12 opacity-40')}
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1">
          <RewardTypeBadge type={reward.rewardType || 'loyalty'} />
          {reward.isHot && (
            <span className="bg-[#ff9969] text-white px-2.5 py-1 rounded-full text-[8px] font-black uppercase shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Hot
            </span>
          )}
          {reward.isLocked && (
            <span className="bg-[#3d2d26] text-white px-2.5 py-1 rounded-full text-[8px] font-black uppercase shadow-sm flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Locked
            </span>
          )}
        </div>
        <div className="absolute top-3 left-3 flex gap-1">
          {!reward.isHot && !reward.isLocked && (
            <span className="bg-[#a23f00]/90 text-white px-2.5 py-1 rounded-full text-[8px] font-black shadow-sm">
              {reward.cost} pts
            </span>
          )}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-extrabold text-[#261812] text-sm leading-tight">{reward.title}</h3>
            <button onClick={onToggleFav} className="shrink-0">
              <Heart className={cn('w-4 h-4', isFavorited ? 'fill-red-500 text-red-500' : 'text-[#8e7164]')} />
            </button>
          </div>
          <p className="text-[11px] font-semibold text-[#5a4136] mb-3">{reward.brand}</p>
          <p className="text-[11px] text-[#5a4136] leading-relaxed mb-3">{reward.description}</p>
          {reward.usageCondition && (
            <p className="text-[9px] text-[#8e7164] italic mb-3 border-l-2 border-[#ff9969] pl-2 leading-relaxed">
              {reward.usageCondition}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[#f8ddd2] mt-auto">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#8e7164]">
            <Clock className="w-3.5 h-3.5" />
            <span>{reward.expiryText}</span>
          </div>
          {isRedeemed ? (
            <div className="bg-[#f8ddd2] text-[#5a4136] px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Used
            </div>
          ) : isClaimed ? (
            <button
              onClick={onMarkScanned}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold active:scale-95 transition-transform flex items-center gap-1"
            >
              <QrCode className="w-3.5 h-3.5" /> Scan
            </button>
          ) : (
            <button
              onClick={onClaim}
              className="bg-[#a23f00] hover:bg-[#7b2f00] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold active:scale-95 transition-transform"
            >
              Redeem
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* Expiring Card */
function ExpiringCard({ reward, onRedeem, isFavorited, onToggleFav }: { reward: RewardDetails; onRedeem: () => void; isFavorited?: boolean; onToggleFav?: (e: React.MouseEvent) => void }) {
  const isUrgent = reward.isUrgent;
  return (
    <div className={cn(
      'bg-white rounded-[20px] overflow-hidden shadow-[0px_4px_20px_rgba(136,115,106,0.08)] flex flex-col border',
      isUrgent ? 'border-[#ba1a1a]/20' : 'border-[#e2bfb0]/30',
    )}>
        <div className="flex p-4 gap-4">
        <div className={cn(
          'w-20 h-20 rounded-xl shrink-0 overflow-hidden relative',
          isUrgent ? 'bg-[#ffdad6]' : 'bg-[#f8ddd2]',
        )}>
          {reward.image ? (
            <img alt={reward.title} className="w-full h-full object-cover" src={reward.image} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getRewardIcon(reward.badgeIcon || 'gift', 'w-8 h-8 opacity-40')}
            </div>
          )}
          {isUrgent && <div className="absolute inset-0 bg-[#ba1a1a]/10" />}
          <div className="absolute bottom-1 left-1">
            <RewardTypeBadge type={reward.rewardType || 'loyalty'} />
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start gap-1 flex-wrap">
              <h3 className="text-sm font-bold text-[#261812] leading-tight truncate min-w-0">{reward.title}</h3>
              {isUrgent && (
                <span className="bg-[#ba1a1a] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                  Expires Soon
                </span>
              )}
              {onToggleFav && (
                <button onClick={onToggleFav} className="ml-auto shrink-0">
                  <Heart className={cn('w-3.5 h-3.5', isFavorited ? 'fill-red-500 text-red-500' : 'text-[#8e7164]')} />
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#5a4136] mt-0.5">{reward.brand}</p>
            {reward.usageCondition && (
              <p className="text-[9px] text-[#8e7164] italic mt-1 leading-tight">{reward.usageCondition}</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              <Clock className={cn('w-3.5 h-3.5', isUrgent ? 'text-[#ba1a1a]' : 'text-[#8e7164]')} />
              <span className={cn('text-[11px] font-bold', isUrgent ? 'text-[#ba1a1a]' : 'text-[#5a4136]')}>
                {reward.expiryText}
              </span>
            </div>
            {reward.cost > 0 && (
              <span className="text-[10px] font-bold text-[#a23f00]">{reward.cost} pts</span>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={onRedeem}
          className={cn(
            'flex-1 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1',
            isUrgent
              ? 'bg-[#a23f00] text-white shadow-md'
              : 'bg-[#97471d] text-white',
          )}
        >
          Redeem Immediately
          <QrCode className="w-4 h-4" />
        </button>
        <button
          onClick={() => {}}
          className="py-3 px-3 rounded-xl text-[10px] font-bold border border-[#e2bfb0]/30 text-[#5a4136] hover:bg-[#ffeae1] transition-all active:scale-95"
          title="View Terms & Conditions"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* Loyalty Card */
function LoyaltyCard({ reward }: { reward: RewardDetails }) {
  const [showOptOut, setShowOptOut] = useState(false);
  const [optedIn, setOptedIn] = useState(reward.isOptedIn ?? true);
  const tierColors: Record<string, { bg: string; text: string; badge: string; dot: string }> = {
    Gold: { bg: 'bg-[#ffdbcc]', text: 'text-[#a23f00]', badge: 'bg-[#a23f00] text-white', dot: 'bg-[#a23f00]' },
    Silver: { bg: 'bg-[#fee3d8]', text: 'text-[#5a4136]', badge: 'bg-[#5a4136] text-white', dot: 'bg-[#5a4136]' },
    Bronze: { bg: 'bg-[#f8ddd2]', text: 'text-[#8e7164]', badge: 'bg-[#8e7164] text-white', dot: 'bg-[#8e7164]' },
  };
  const tc = tierColors[reward.tier ?? 'Bronze'] || tierColors.Bronze;

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-[0px_4px_20px_rgba(136,115,106,0.08)] border border-[#e2bfb0]/30 flex flex-col gap-4 transition-all active:scale-[0.98]">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden', tc.bg)}>
            {getRewardIcon(reward.badgeIcon || 'trophy', 'w-7 h-7')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#261812]">{reward.title}</h3>
              <RewardTypeBadge type={reward.rewardType || 'loyalty'} />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Trophy className="w-4 h-4 text-[#97471d]" />
              <span className={cn('text-[10px] font-bold uppercase tracking-wide', tc.text)}>
                {reward.tier} Tier
              </span>
            </div>
          </div>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-[10px] font-bold', tc.badge)}>
          {optedIn ? (reward.tier === 'Gold' ? 'Active' : 'Standard') : 'Opted Out'}
        </span>
      </div>

      {reward.progress !== undefined && optedIn && (
        <div>
          <div className="flex justify-between text-[10px] font-medium text-[#5a4136] mb-1">
            <span>Progress to Platinum</span>
            <span className="font-bold text-[#a23f00]">{reward.progress}%</span>
          </div>
          <div className="h-2 w-full bg-[#f8ddd2] rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full', tc.dot)} style={{ width: `${reward.progress}%` }} />
          </div>
        </div>
      )}

      {reward.accumulationRules && optedIn && (
        <div className="bg-[#ffeae1] rounded-xl p-3 text-[10px] text-[#5a4136] leading-relaxed border border-[#e2bfb0]/30">
          <span className="font-bold text-[#a23f00] block mb-0.5">How points work:</span>
          {reward.accumulationRules}
        </div>
      )}

      {reward.benefits && reward.benefits.length > 0 && optedIn && (
        <div className="flex flex-wrap gap-1">
          {reward.benefits.map((b, i) => (
            <span key={i} className="bg-[#f8ddd2] px-3 py-1 rounded-full text-[10px] font-medium text-[#5a4136]">
              {b}
            </span>
          ))}
        </div>
      )}

      {optedIn ? (
        <div className="flex gap-2">
          <button
            onClick={() => setShowOptOut(true)}
            className="flex-1 py-2.5 border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-2xl text-[10px] font-bold hover:bg-[#ffdad6] transition-all active:scale-95"
          >
            Opt Out
          </button>
          <button
            onClick={() => {}}
            className="flex-1 py-2.5 bg-[#a23f00] text-white rounded-2xl text-[10px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform shadow-md"
          >
            View Details
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOptedIn(true)}
          className="w-full py-2.5 bg-[#a23f00] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform shadow-md"
        >
          Re-join Program
          <Check className="w-4 h-4" />
        </button>
      )}

      {showOptOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowOptOut(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-[#261812] text-sm">Leave {reward.title}?</h3>
            <p className="text-[11px] text-[#5a4136] leading-relaxed">
              You will lose your current tier benefits and progress. You can re-join at any time.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowOptOut(false)}
                className="flex-1 py-2.5 border border-[#e2bfb0]/30 rounded-xl text-[10px] font-bold text-[#5a4136] hover:bg-[#ffeae1] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => { setOptedIn(false); setShowOptOut(false); }}
                className="flex-1 py-2.5 bg-[#ba1a1a] text-white rounded-xl text-[10px] font-bold hover:bg-[#8b0000] transition-all"
              >
                Confirm Opt Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Redeemed Card */
function RedeemedCard({ reward }: { reward: RewardDetails }) {
  const isSuccess = reward.status === 'redeemed';
  const isFailed = reward.status === 'expired';
  return (
    <div className={cn(
      'bg-white rounded-xl p-5 shadow-[0px_4px_20px_rgba(136,115,106,0.08)] flex flex-col gap-4 border',
      isFailed ? 'border-[#e2bfb0]/30 grayscale opacity-75' : 'border-[#e2bfb0]/30',
    )}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            isSuccess ? 'bg-[#a23f00]/10' : 'bg-[#8e7164]/10',
          )}>
            {getRewardIcon(reward.badgeIcon || 'gift', cn('w-6 h-6', isSuccess ? 'text-[#a23f00]' : 'text-[#8e7164]'))}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#261812]">{reward.title}</h3>
              <RewardTypeBadge type={reward.rewardType || 'loyalty'} />
            </div>
            <p className="text-[10px] font-medium text-[#5a4136]">{reward.brand || 'Brand'}</p>
          </div>
        </div>
        <span className={cn(
          'px-3 py-1 rounded-full text-[10px] font-bold uppercase',
          isSuccess ? 'bg-[#cfe4ff]/10 text-[#00629f]' : 'bg-[#ffdad6]/10 text-[#ba1a1a]',
        )}>
          {isSuccess ? 'Success' : 'Failed'}
        </span>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-[#e2bfb0]/20">
        <div className="text-[10px] font-medium text-[#5a4136] space-y-1">
          <span className="block">{reward.redeemedDate}</span>
          <span className="text-[9px] opacity-70">{reward.redeemedTime}</span>
          {reward.valueUsed !== undefined && (
            <span className="block text-[9px] font-bold text-[#a23f00]">{reward.valueUsed.toLocaleString()} pts consumed</span>
          )}
        </div>
        {isSuccess && (
          <button className="flex items-center gap-1 text-[#a23f00] text-xs font-bold active:scale-95 transition-all">
            <QrCode className="w-4 h-4" />
            Re-download QR
          </button>
        )}
        {isFailed && (
          <span className="text-[10px] font-medium text-[#8e7164] cursor-not-allowed">Unavailable</span>
        )}
      </div>
    </div>
  );
}

/* ====== DETAILS VIEW ====== */
function DetailsView({
  reward,
  isClaimed,
  isRedeemed,
  isFavorited,
  onBack,
  onClaim,
  onMarkScanned,
  onToggleFav,
  onShare,
  onTransfer,
}: {
  reward: RewardDetails;
  isClaimed: boolean;
  isRedeemed: boolean;
  isFavorited: boolean;
  onBack: () => void;
  onClaim: () => void;
  onMarkScanned: () => void;
  onToggleFav: (e: React.MouseEvent) => void;
  onShare: () => void;
  onTransfer?: () => void;
}) {
  return (
    <div className="animate-in fade-in duration-300 space-y-5 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl border border-[#e2bfb0]/30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#ffeae1] border border-[#e2bfb0] rounded-xl transition-all active:scale-90"
          >
            <ArrowLeft className="w-4 h-4 text-[#a23f00]" />
          </button>
          <h1 className="font-extrabold text-[#261812] text-sm truncate max-w-[180px]">{reward.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onToggleFav} className="p-2 hover:bg-[#ffeae1] border border-[#e2bfb0] rounded-xl transition-all active:scale-90">
            <Heart className={cn('w-4 h-4', isFavorited ? 'fill-red-500 text-red-500' : 'text-[#8e7164]')} />
          </button>
          <button onClick={onShare} className="p-2 hover:bg-[#ffeae1] border border-[#e2bfb0] rounded-xl transition-all active:scale-90">
            <Share2 className="w-4 h-4 text-[#8e7164]" />
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="relative w-full h-[280px] overflow-hidden rounded-3xl border border-[#e2bfb0]/30 shadow-md">
        {reward.image ? (
          <img alt={reward.title} className="w-full h-full object-cover" src={reward.image} />
        ) : (
          <div className="w-full h-full bg-[#f8ddd2] flex items-center justify-center">
            {getRewardIcon(reward.badgeIcon || 'gift', 'w-16 h-16 opacity-40')}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ff6904]/90 text-white text-[8px] font-black uppercase tracking-wider mb-2">
            <Star className="w-3 h-3 mr-1 fill-white" />
            Premium Reward
          </span>
          <h2 className="text-xl font-black text-white">{reward.title}</h2>
          <p className="text-sm text-white/80">{reward.brand}</p>
        </div>
      </section>

      {/* Info Grid */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#e2bfb0]/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#f8ddd2] flex items-center justify-center">
                {getRewardIcon(reward.badgeIcon || 'gift', 'w-6 h-6')}
              </div>
              <div>
                <p className="text-xs font-bold text-[#261812]">{reward.brand}</p>
                <p className="text-[9px] font-medium text-[#8e7164]">Available at all kiosks</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-extrabold text-[#a23f00]">{reward.cost} pts</p>
              <p className="text-[9px] font-bold text-[#ba1a1a] flex items-center gap-1 mt-0.5 justify-end">
                <Clock className="w-3 h-3" />
                {reward.expiryText}
              </p>
            </div>
          </div>
          <div className="h-px bg-[#f8ddd2]" />
          <p className="text-xs text-[#5a4136] leading-relaxed">{reward.longDescription}</p>
        </div>

        {/* QR / Claim Section */}
        <div className="bg-white rounded-3xl p-5 border border-[#e2bfb0]/30 shadow-sm flex flex-col items-center text-center gap-4">
          <p className="text-xs font-bold text-[#261812]">Redemption QR Code</p>
          <div className="bg-white p-4 rounded-2xl border-2 border-[#a23f00]/10 relative">
            <img
              alt="QR Code"
              className={cn(
                'w-32 h-32 select-none pointer-events-none transition-all duration-500',
                isClaimed ? 'opacity-100 blur-0' : 'opacity-30 blur-[2px]',
              )}
              src="https://lh3.googleusercontent.com/aida/AP1WRLuBrrLwVCEqPp8totEq6B-Ccmw69aJ3jmFcABXdbgpH2L2hfkVTfsFJnIeUQ5iU-MjZomqpC2cmUZE7sH-6SxYHxqJgcpj6XHO6W5yYXESiA621CTVy_rhaE_TPgQFFZ8QpxylFY79rk49v4bEFlSpD8KWWHAahHHJr8tPQLXenATDNFKRAaULtaw6jH6MzmkQR4RSsXQYtVEoKTlCW_lMAzNuKXyv8MME5flg02_q4FWa_Coy4BcvF_cGn"
            />
            {!isClaimed && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
                <div
                  onClick={onClaim}
                  className="w-10 h-10 rounded-full bg-[#a23f00] text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-90 transition-transform"
                >
                  <Lock className="w-4 h-4" />
                </div>
              </div>
            )}
            {isClaimed && !isRedeemed && (
              <div
                onClick={onMarkScanned}
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-emerald-600/90 text-white transition-opacity duration-300 cursor-pointer text-[9px] font-black rounded-lg uppercase"
              >
                Click to Scan
              </div>
            )}
          </div>
          <p className="text-[9px] text-[#8e7164] font-bold uppercase tracking-wider">
            {isRedeemed ? 'Voucher Used' : isClaimed ? 'Scan at counter' : 'Claim to unlock'}
          </p>
        </div>
      </div>

      {/* Action Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Bookmark, label: isFavorited ? 'Saved' : 'Save', onClick: onToggleFav, color: isFavorited ? 'text-red-500' : 'text-[#a23f00]' },
          { icon: Share2, label: 'Share', onClick: onShare, color: 'text-[#a23f00]' },
          { icon: Info, label: 'Terms', onClick: () => {}, color: 'text-[#a23f00]' },
          { icon: MapPin, label: 'Find Store', onClick: () => {}, color: 'text-[#a23f00]' },
          ...(onTransfer && reward.rewardType === 'voucher' ? [{ icon: Send, label: 'Transfer', onClick: onTransfer, color: 'text-[#a23f00]' as const }] : []),
        ].map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className="bg-white hover:bg-[#ffeae1] border border-[#e2bfb0]/30 transition-all p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95"
          >
            <action.icon className={cn('w-5 h-5', action.color)} />
            <span className="text-[9px] font-bold text-[#261812]">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-white p-5 rounded-3xl border border-[#e2bfb0]/30 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 font-bold text-xs text-[#261812]">
            <Trophy className="w-4 h-4 text-[#a23f00]" />
            <span>Next Milestone: Platinum Status</span>
          </div>
          <span className="text-[9px] font-bold text-[#a23f00]">150 / 500 XP</span>
        </div>
        <div className="w-full h-2 bg-[#f8ddd2] rounded-full overflow-hidden">
          <div className="h-full bg-[#a23f00] rounded-full" style={{ width: '30%' }} />
        </div>
        <p className="text-[9px] text-[#8e7164] font-medium italic">
          &quot;You&apos;re just 3 coffees away from your next reward boost!&quot;
        </p>
      </div>

      {/* Mobile CTA */}
      <footer className="fixed bottom-0 left-0 w-full z-40 px-5 py-4 bg-white/95 backdrop-blur-md border-t border-[#e2bfb0]/30 md:hidden">
        <div className="max-w-md mx-auto">
          {isRedeemed ? (
            <div className="bg-[#f8ddd2] text-[#5a4136] font-bold text-xs py-4 rounded-full flex items-center justify-center gap-2">
              REWARD REDEEMED <Check className="w-4 h-4" />
            </div>
          ) : isClaimed ? (
            <button
              onClick={onMarkScanned}
              className="w-full bg-emerald-600 text-white font-bold text-xs py-4 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              VOUCHER ACTIVE (SCAN NOW)
              <QrCode className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClaim}
              className="w-full bg-[#a23f00] hover:bg-[#7b2f00] text-white font-bold text-xs py-4 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              REDEEM REWARD
              <Zap className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

/* ====== TRANSFER MODAL ====== */
function TransferModal({
  reward,
  onClose,
  onTransfer,
}: {
  reward: RewardDetails;
  onClose: () => void;
  onTransfer: (recipient: string) => void;
}) {
  const [recipient, setRecipient] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form');
  const isValid = /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(recipient) || /^\d{10,}$/.test(recipient);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-[#a23f00]" />
              <h3 className="text-sm font-extrabold text-[#261812]">Transfer Voucher</h3>
            </div>
            <button onClick={onClose} className="p-1 text-[#8e7164] hover:text-[#ba1a1a] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {step === 'form' && (
            <div className="space-y-4">
              <div className="bg-[#ffeae1] rounded-2xl p-4 border border-[#e2bfb0]/30">
                <p className="text-xs font-bold text-[#261812]">{reward.title}</p>
                <p className="text-[10px] text-[#5a4136]">{reward.brand}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#5a4136] uppercase tracking-wider block mb-1">
                  Recipient Email or Phone
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="email@example.com or 05XXXXXXXX"
                  className="w-full px-4 py-3 rounded-2xl border border-[#e2bfb0] text-xs font-medium text-[#261812] bg-white placeholder:text-[#8e7164] focus:outline-none focus:ring-2 focus:ring-[#a23f00]/20 focus:border-[#a23f00] transition-all"
                />
              </div>
              <button
                onClick={() => setStep('confirm')}
                disabled={!isValid}
                className={cn(
                  'w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2',
                  isValid ? 'bg-[#a23f00] text-white shadow-md active:scale-95' : 'bg-[#e2bfb0]/30 text-[#8e7164] cursor-not-allowed',
                )}
              >
                <Send className="w-4 h-4" /> Continue
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <p className="text-[11px] text-[#5a4136] leading-relaxed">
                You are about to transfer <strong className="text-[#261812]">{reward.title}</strong> to <strong className="text-[#a23f00]">{recipient}</strong>. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 py-3 border border-[#e2bfb0]/30 rounded-2xl text-[10px] font-bold text-[#5a4136] hover:bg-[#ffeae1] transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('done')}
                  className="flex-1 py-3 bg-[#a23f00] text-white rounded-2xl text-[10px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md"
                >
                  Confirm Transfer
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-extrabold text-[#261812] text-sm">Transfer Successful!</h4>
              <p className="text-[11px] text-[#5a4136]">
                {reward.title} has been sent to <strong className="text-[#a23f00]">{recipient}</strong>.
              </p>
              <button
                onClick={() => { onTransfer(recipient); }}
                className="w-full py-3 bg-[#a23f00] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====== HISTORY MODAL ====== */
function HistoryModal({
  onClose,
  claimedIds,
  redeemedIds,
  rewards,
}: {
  onClose: () => void;
  claimedIds: string[];
  redeemedIds: string[];
  rewards: Record<string, RewardDetails>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-[#e2bfb0]/20 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#a23f00]" />
            <h3 className="text-sm font-extrabold text-[#261812]">Points History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8e7164] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center p-4 bg-[#f8ddd2] rounded-2xl">
            <div>
              <h4 className="text-xs font-bold text-[#261812]">Initial Balance</h4>
              <p className="text-[9px] font-medium text-[#8e7164]">Account Sign-up Welcome</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-600">+1,240 pts</span>
          </div>
          {claimedIds.map(id => {
            const item = rewards[id];
            if (!item) return null;
            return (
              <div key={id} className="flex justify-between items-center p-4 bg-[#f8ddd2] rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-[#261812]">Claimed {item.title}</h4>
                  <p className="text-[9px] font-medium text-[#8e7164]">{item.brand || 'Brand'}</p>
                </div>
                <span className="text-xs font-extrabold text-rose-600">-{item.cost} pts</span>
              </div>
            );
          })}
          {redeemedIds.map(id => {
            const item = rewards[id];
            if (!item) return null;
            return (
              <div key={id} className="flex justify-between items-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div>
                  <h4 className="text-xs font-bold text-emerald-700">Scanned {item.title}</h4>
                  <p className="text-[9px] text-emerald-600/70 font-medium">Used at {item.brand || 'Brand'}</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-700">Used</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RewardsView;
