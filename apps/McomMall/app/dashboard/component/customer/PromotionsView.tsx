'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Star,
  Clock,
  ArrowLeft,
  Share2,
  Lock,
  Check,
  Zap,
  Bookmark,
  Info,
  MapPin,
  X,
  Sparkles,
  ShoppingBag,
  Utensils,
  Gift,
  QrCode,
  PartyPopper,
  Diamond,
  Tag,
  Store,
  Sun,
  Building2,
  Flame,
  MapPinned,
  Layers,
  Scan,
  MessageCircle,
  Link,
  Smartphone,
  Trophy,
  Unlock,
  ChevronRight,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { RootState } from '@/service/store/store';
import {
  PROMOTIONS_MOCK_DATA,
  PROMOTION_TYPE_CONFIG,
  type PromotionItem,
  type PromotionTypeTag,
  type PromotionsTab,
} from '@/lib/mock-data/promotions-mock-data';

type SubView = 'dashboard' | 'details';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

function getPromoIcon(icon: string, className = 'w-5 h-5') {
  const cnIcon = cn(className);
  switch (icon) {
    case 'flash_on': return <Zap className={cn('text-rose-600', cnIcon)} />;
    case 'local_cafe': return <Star className={cn('text-amber-600', cnIcon)} />;
    case 'restaurant': return <Utensils className={cn('text-orange-600', cnIcon)} />;
    case 'checkroom': return <ShoppingBag className={cn('text-[#a23f00]', cnIcon)} />;
    case 'fitness_center': return <Flame className={cn('text-emerald-600', cnIcon)} />;
    case 'location_city': return <Building2 className={cn('text-indigo-600', cnIcon)} />;
    case 'storefront': return <Store className={cn('text-[#97471d]', cnIcon)} />;
    case 'family_restroom': return <Heart className={cn('text-pink-500', cnIcon)} />;
    case 'spa': return <Sparkles className={cn('text-teal-500', cnIcon)} />;
    case 'clean_hands': return <Check className={cn('text-sky-500', cnIcon)} />;
    case 'self_improvement': return <Heart className={cn('text-purple-500', cnIcon)} />;
    case 'wb_sunny': return <Sun className={cn('text-amber-500', cnIcon)} />;
    case 'school': return <Layers className={cn('text-blue-600', cnIcon)} />;
    case 'celebration': return <PartyPopper className={cn('text-purple-500', cnIcon)} />;
    case 'diamond': return <Diamond className={cn('text-cyan-500', cnIcon)} />;
    case 'smartphone': return <QrCode className={cn('text-gray-600', cnIcon)} />;
    default: return <Tag className={cn('text-[#a23f00]', cnIcon)} />;
  }
}

function Heart({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}

function parseExpiresAt(expiresAt: string): Date {
  const now = new Date();
  let match = expiresAt.match(/\+(\d+)(d|h|m)/);
  if (match) {
    const val = parseInt(match[1]);
    const unit = match[2];
    const ms = unit === 'd' ? val * 86400000 : unit === 'h' ? val * 3600000 : val * 60000;
    return new Date(now.getTime() + ms);
  }
  match = expiresAt.match(/(\d+)h(\d+)m/);
  if (match) {
    return new Date(now.getTime() + parseInt(match[1]) * 3600000 + parseInt(match[2]) * 60000);
  }
  return new Date(now.getTime() + 3600000);
}

function CountdownTimer({ target }: { target: Date }) {
  const [remaining, setRemaining] = React.useState('');
  React.useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setRemaining('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 0) setRemaining(`${h}h ${m}m ${s}s`);
      else if (m > 0) setRemaining(`${m}m ${s}s`);
      else setRemaining(`${s}s`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);
  return <span>{remaining}</span>;
}

function ExpiryDisplay({ expiresAt, expiryText, isUrgent }: { expiresAt?: string; expiryText: string; isUrgent?: boolean }) {
  const [targetDate, setTargetDate] = React.useState<Date | null>(null);
  React.useEffect(() => {
    if (expiresAt) {
      setTargetDate(parseExpiresAt(expiresAt));
    }
  }, [expiresAt]);
  if (targetDate) {
    return <CountdownTimer target={targetDate} />;
  }
  return <span className={isUrgent ? 'text-[#ba1a1a]' : ''}>{expiryText}</span>;
}

function DistanceBadge({ distance }: { distance: string }) {
  const d = parseFloat(distance);
  const color = d <= 0.3 ? 'text-emerald-600 bg-emerald-50' : d <= 1 ? 'text-amber-600 bg-amber-50' : 'text-slate-600 bg-slate-50';
  return (
    <span className={cn('inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full', color)}>
      <MapPinned className="w-3 h-3" />
      Within {distance}
    </span>
  );
}

function getTabIcon(tab: PromotionsTab, className = 'w-5 h-5') {
  const cnIcon = cn(className);
  switch (tab) {
    case 'all': return <Layers className={cnIcon} />;
    case 'nearby': return <MapPinned className={cnIcon} />;
    case 'flash': return <Zap className={cnIcon} />;
    case 'borough': return <Building2 className={cnIcon} />;
    case 'saved': return <Bookmark className={cnIcon} />;
    case 'expiring': return <Clock className={cnIcon} />;
  }
}

function PromotionTypeBadge({ type }: { type: PromotionTypeTag }) {
  const cfg = PROMOTION_TYPE_CONFIG[type];
  if (!cfg) return null;
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider', cfg.bg, cfg.text)}>
      {cfg.label}
    </span>
  );
}

const TABS: { id: PromotionsTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'flash', label: 'Flash Deals' },
  { id: 'borough', label: 'Borough' },
  { id: 'saved', label: 'Saved' },
  { id: 'expiring', label: 'Expiring Soon' },
];

/* ====== SHARE MODAL ====== */
function ShareModal({ onClose, promoTitle }: { onClose: () => void; promoTitle: string }) {
  const shareChannels = [
    { icon: MessageCircle, label: 'WhatsApp', color: 'text-green-500 bg-green-50', action: () => window.open(`https://wa.me/?text=Check%20out%20this%20deal%3A%20${encodeURIComponent(promoTitle)}`, '_blank') },
    { icon: MessageCircle, label: 'SMS', color: 'text-blue-500 bg-blue-50', action: () => { navigator.clipboard?.writeText(`Check out this deal: ${promoTitle}`); } },
    { icon: Smartphone, label: 'Messenger', color: 'text-indigo-500 bg-indigo-50', action: () => {} },
    { icon: Link, label: 'Copy Link', color: 'text-[#a23f00] bg-[#ffeae1]', action: () => { navigator.clipboard?.writeText(`https://mcom.app/promotions/${encodeURIComponent(promoTitle.toLowerCase().replace(/\s+/g, '-'))}`); } },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-[#261812] flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#a23f00]" />
            Share Offer
          </h3>
          <button onClick={onClose} className="p-1 text-[#8e7164] hover:text-[#ba1a1a] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[#5a4136]">Share &quot;{promoTitle}&quot; with friends and family</p>
        <div className="grid grid-cols-2 gap-3">
          {shareChannels.map((ch, i) => (
            <button
              key={i}
              onClick={() => { ch.action(); onClose(); }}
              className={cn('flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#e2bfb0]/30 hover:shadow-sm transition-all active:scale-95', ch.color)}
            >
              <ch.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold">{ch.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ====== TERMS MODAL ====== */
function TermsModal({ onClose, terms }: { onClose: () => void; terms: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-[#261812] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#a23f00]" />
            Terms & Conditions
          </h3>
          <button onClick={onClose} className="p-1 text-[#8e7164] hover:text-[#ba1a1a] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[#5a4136] leading-relaxed">{terms}</p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#a23f00] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

/* ====== QR SCANNER MODAL ====== */
function QrScannerModal({ onClose, onScanResult }: { onClose: () => void; onScanResult: (promo: PromotionItem) => void }) {
  const [step, setStep] = useState<'scan' | 'result' | 'error'>('scan');
  const [scannedPromo, setScannedPromo] = useState<PromotionItem | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  React.useEffect(() => {
    let mounted = true;
    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!mounted || !scannerRef.current) return;
        const scanner = new Html5Qrcode('qr-reader');
        html5QrCodeRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            const match = Object.values(PROMOTIONS_MOCK_DATA).find(
              p => p.redeemCode === decodedText || p.id === decodedText || p.title.toLowerCase().replace(/\s+/g, '-') === decodedText.toLowerCase().replace(/\s+/g, '-')
            );
            if (match && mounted) {
              scanner.stop().catch(() => {});
              setScannedPromo(match);
              setStep('result');
            }
          },
          () => {},
        );
      } catch {
        if (mounted) setStep('error');
      }
    };
    startScanner();
    return () => { mounted = false; if (html5QrCodeRef.current) html5QrCodeRef.current.stop().catch(() => {}); };
  }, []);

  const simulateScan = useCallback(() => {
    const promos = Object.values(PROMOTIONS_MOCK_DATA);
    const randomPromo = promos[Math.floor(Math.random() * promos.length)];
    setScannedPromo(randomPromo);
    setStep('result');
  }, []);

  const simulateError = useCallback(() => {
    setStep('error');
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
        {step === 'scan' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-48 h-48 mx-auto relative">
              <div id="qr-reader" ref={scannerRef} className="w-full h-full" />
              <div className="absolute inset-0 border-2 border-[#a23f00] rounded-2xl pointer-events-none" />
              <div className="absolute inset-4 border-2 border-dashed border-[#ff9969]/50 rounded-xl pointer-events-none" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#a23f00] rounded-tl-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#a23f00] rounded-tr-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#a23f00] rounded-bl-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#a23f00] rounded-br-2xl pointer-events-none" />
            </div>
            <p className="text-xs font-bold text-[#261812]">Point your camera at a QR code</p>
            <p className="text-[10px] text-[#8e7164]">Scan a promotion QR from any MCOM Mall store or poster</p>
            <div className="flex gap-2">
              <button
                onClick={simulateScan}
                className="flex-1 py-3 bg-[#a23f00] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Scan className="w-4 h-4" />
                Simulate
              </button>
              <button
                onClick={onClose}
                className="py-3 px-4 border border-[#e2bfb0]/30 rounded-2xl text-[10px] font-bold text-[#5a4136] hover:bg-[#ffeae1] active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'result' && scannedPromo && (
          <div className="p-6 text-center space-y-5">
            <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="font-extrabold text-[#261812] text-base">Promotion Found!</h3>
            <div className="bg-[#ffeae1] rounded-2xl p-4 text-left flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#f8ddd2] flex items-center justify-center shrink-0">
                {getPromoIcon(scannedPromo.badgeIcon, 'w-6 h-6')}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#261812]">{scannedPromo.title}</p>
                <p className="text-[10px] text-[#5a4136]">{scannedPromo.businessName} · {scannedPromo.benefitValue}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { onScanResult(scannedPromo); onClose(); }}
                className="flex-1 py-3 bg-[#a23f00] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md"
              >
                View & Redeem
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-[#e2bfb0]/30 rounded-2xl text-[10px] font-bold text-[#5a4136] hover:bg-[#ffeae1] active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="p-6 text-center space-y-5">
            <div className="w-20 h-20 mx-auto bg-rose-100 rounded-full flex items-center justify-center">
              <X className="w-10 h-10 text-rose-600" />
            </div>
            <h3 className="font-extrabold text-[#261812] text-base">No Code Detected</h3>
            <p className="text-xs text-[#5a4136]">Make sure the QR code is well-lit and centered in the frame.</p>
            <button
              onClick={() => setStep('scan')}
              className="w-full py-3 bg-[#a23f00] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== UNLOCK REWARD MODAL ====== */
function UnlockRewardModal({
  promo,
  onClose,
  onUnlock,
}: {
  promo: PromotionItem;
  onClose: () => void;
  onUnlock: () => void;
}) {
  const progress = promo.unlockProgress ?? 0;
  const target = promo.unlockTarget ?? 1;
  const pct = Math.min(Math.round((progress / target) * 100), 100);
  const isReady = progress >= target;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 space-y-5 text-center" onClick={e => e.stopPropagation()}>
        <div className={cn(
          'w-20 h-20 mx-auto rounded-full flex items-center justify-center',
          isReady ? 'bg-amber-100' : 'bg-[#f8ddd2]',
        )}>
          {isReady ? (
            <Trophy className="w-10 h-10 text-amber-600" />
          ) : (
            <Lock className="w-10 h-10 text-[#8e7164]" />
          )}
        </div>
        <h3 className="font-extrabold text-[#261812] text-base">
          {isReady ? 'Reward Ready to Unlock!' : 'Unlock Reward'}
        </h3>
        <p className="text-xs text-[#5a4136]">{promo.unlockCondition}</p>
        {promo.unlockRewardDescription && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/50">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Reward</p>
            <p className="text-sm font-bold text-[#261812] mt-1">{promo.unlockRewardDescription}</p>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-[#5a4136]">
            <span>Progress</span>
            <span className={isReady ? 'text-emerald-600' : 'text-[#a23f00]'}>{progress} / {target}</span>
          </div>
          <div className="w-full h-2.5 bg-[#f8ddd2] rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', isReady ? 'bg-emerald-500' : 'bg-[#a23f00]')}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {isReady ? (
          <button
            onClick={onUnlock}
            className="w-full py-3 bg-amber-600 text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            Unlock Reward
          </button>
        ) : (
          <p className="text-[10px] text-[#8e7164] italic">
            {target - progress} more {(target - progress) === 1 ? 'visit' : 'visits'} needed to unlock
          </p>
        )}
      </div>
    </div>
  );
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const PromotionsView: React.FC = () => {
  const { userName } = useSelector((state: RootState) => state.auth);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  React.useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { /* permission denied, use mock location */ },
        { enableHighAccuracy: false, timeout: 5000 },
      );
    }
  }, []);

  const [subView, setSubView] = useState<SubView>('dashboard');
  const [activeTab, setActiveTab] = useState<PromotionsTab>('all');
  const [selectedPromoId, setSelectedPromoId] = useState<string>('flash-1');
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('promotions_saved');
        return stored ? JSON.parse(stored) : {};
      } catch { return {}; }
    }
    return {};
  });
  const [redeemedIds, setRedeemedIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('promotions_redeemed');
        return stored ? JSON.parse(stored) : [];
      } catch { return []; }
    }
    return [];
  });
  const [joinedCampaignIds, setJoinedCampaignIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('promotions_joined');
        return stored ? JSON.parse(stored) : [];
      } catch { return []; }
    }
    return [];
  });
  const [unlockedPromoIds, setUnlockedPromoIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('promotions_unlocked');
        return stored ? JSON.parse(stored) : [];
      } catch { return []; }
    }
    return [];
  });
  const [toast, setToast] = useState<ToastState | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [codeResult, setCodeResult] = useState<{ success: boolean; message: string } | null>(null);
  const [scanConfirm, setScanConfirm] = useState<PromotionItem | null>(null);

  const [shareModalPromo, setShareModalPromo] = useState<PromotionItem | null>(null);
  const [termsModalPromo, setTermsModalPromo] = useState<PromotionItem | null>(null);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [selectedBoroughFilter, setSelectedBoroughFilter] = useState<string>('all');
  const [showNearbyMap, setShowNearbyMap] = useState(false);
  const [unlockModalPromo, setUnlockModalPromo] = useState<PromotionItem | null>(null);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const allPromotions = useMemo(() => Object.values(PROMOTIONS_MOCK_DATA), []);

  const knownBoroughs = useMemo(() => {
    const boroughs = new Set<string>();
    allPromotions.forEach(p => { if (p.borough) boroughs.add(p.borough); });
    return ['all', ...Array.from(boroughs)];
  }, [allPromotions]);

  const TYPE_ORDER: Record<PromotionTypeTag, number> = {
    flash: 0,
    daily: 1,
    borough: 2,
    nearby: 3,
    seasonal: 4,
    high_street: 5,
  };

  const isExpiringText = useCallback((text: string): boolean => {
    const lower = text.toLowerCase();
    return !!(lower.includes('hour') || lower.includes('min') || lower.includes('h ') || lower.endsWith('h') || lower.match(/\d+h\s/));
  }, []);

  const getExpiringSorted = useCallback((promos: PromotionItem[]): PromotionItem[] => {
    return [...promos].sort((a, b) => {
      const aUrgent = a.isUrgent ? 0 : 1;
      const bUrgent = b.isUrgent ? 0 : 1;
      if (aUrgent !== bUrgent) return aUrgent - bUrgent;
      const aMatch = a.expiryText.match(/(\d+)\s*(h|hr|hour|min|day)/i);
      const bMatch = b.expiryText.match(/(\d+)\s*(h|hr|hour|min|day)/i);
      if (aMatch && bMatch) {
        const aNum = parseInt(aMatch[1]) * (aMatch[2].toLowerCase().startsWith('h') ? 60 : aMatch[2].toLowerCase().startsWith('d') ? 1440 : 1);
        const bNum = parseInt(bMatch[1]) * (bMatch[2].toLowerCase().startsWith('h') ? 60 : bMatch[2].toLowerCase().startsWith('d') ? 1440 : 1);
        return aNum - bNum;
      }
      if (aMatch) return -1;
      if (bMatch) return 1;
      return 0;
    });
  }, []);

  const getFilteredPromotions = useCallback((): PromotionItem[] => {
    switch (activeTab) {
      case 'all':
        return [...allPromotions].sort((a, b) => {
          const typeDiff = TYPE_ORDER[a.promotionType] - TYPE_ORDER[b.promotionType];
          if (typeDiff !== 0) return typeDiff;
          if (a.isUrgent && !b.isUrgent) return -1;
          if (!a.isUrgent && b.isUrgent) return 1;
          return 0;
        });
      case 'nearby': {
        const nearby = allPromotions.filter(p => p.promotionType === 'nearby' || p.distance);
        return nearby.sort((a, b) => {
          const aDist = userLocation && a.lat && a.lng ? haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng) : parseFloat(a.distance ?? '99');
          const bDist = userLocation && b.lat && b.lng ? haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng) : parseFloat(b.distance ?? '99');
          return aDist - bDist;
        });
      }
      case 'flash':
        return allPromotions.filter(p => p.promotionType === 'flash');
      case 'borough':
        return allPromotions.filter(p =>
          p.promotionType === 'borough' &&
          (selectedBoroughFilter === 'all' || p.borough === selectedBoroughFilter)
        );
      case 'saved':
        return allPromotions.filter(p => savedIds[p.id]);
      case 'expiring':
        return getExpiringSorted(allPromotions.filter(p => p.isUrgent || isExpiringText(p.expiryText)));
      default:
        return allPromotions;
    }
  }, [activeTab, allPromotions, savedIds, getExpiringSorted, isExpiringText, selectedBoroughFilter, userLocation]);

  const handleNavigateToDetails = useCallback((id: string) => {
    setSelectedPromoId(id);
    setSubView('details');
  }, []);

  const toggleSaved = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (typeof window !== 'undefined') {
        localStorage.setItem('promotions_saved', JSON.stringify(next));
      }
      showToast(next[id] ? 'Promotion saved!' : 'Removed from saved!', 'info');
      return next;
    });
  }, [showToast]);

  const handleRedeem = useCallback((promo: PromotionItem) => {
    if (redeemedIds.includes(promo.id)) {
      showToast('Already redeemed!', 'info');
      return;
    }
    setRedeemedIds(prev => {
      const next = [...prev, promo.id];
      if (typeof window !== 'undefined') {
        localStorage.setItem('promotions_redeemed', JSON.stringify(next));
      }
      return next;
    });
    setScanConfirm(promo);
    showToast(`"${promo.title}" activated! Show at counter.`, 'success');
  }, [redeemedIds, showToast]);

  const handleJoinCampaign = useCallback((promo: PromotionItem) => {
    if (joinedCampaignIds.includes(promo.id)) {
      showToast('Already joined this campaign!', 'info');
      return;
    }
    setJoinedCampaignIds(prev => {
      const next = [...prev, promo.id];
      if (typeof window !== 'undefined') {
        localStorage.setItem('promotions_joined', JSON.stringify(next));
      }
      return next;
    });
    showToast(`Joined "${promo.campaignName ?? promo.title}"!`, 'success');
  }, [joinedCampaignIds, showToast]);

  const handleUnlock = useCallback((promo: PromotionItem) => {
    if (unlockedPromoIds.includes(promo.id)) {
      showToast('Reward already unlocked!', 'info');
      return;
    }
    setUnlockedPromoIds(prev => {
      const next = [...prev, promo.id];
      if (typeof window !== 'undefined') {
        localStorage.setItem('promotions_unlocked', JSON.stringify(next));
      }
      return next;
    });
    setUnlockModalPromo(null);
    setScanConfirm(promo);
    showToast(`"${promo.unlockRewardDescription ?? promo.title}" unlocked!`, 'success');
  }, [unlockedPromoIds, showToast]);

  const handleQrScanResult = useCallback((promo: PromotionItem) => {
    setSelectedPromoId(promo.id);
    setSubView('details');
    showToast(`Found: ${promo.title} at ${promo.businessName}`, 'success');
  }, [showToast]);

  const selectedPromo = PROMOTIONS_MOCK_DATA[selectedPromoId] ?? allPromotions[0];
  const isSelectedSaved = !!savedIds[selectedPromo.id];
  const isSelectedRedeemed = redeemedIds.includes(selectedPromo.id);
  const isSelectedJoined = joinedCampaignIds.includes(selectedPromo.id);
  const isSelectedUnlocked = unlockedPromoIds.includes(selectedPromo.id);
  const isCampaignPromo = selectedPromo.campaignName !== undefined;
  const hasUnlockCondition = selectedPromo.unlockCondition !== undefined;
  const savedCount = Object.keys(savedIds).filter(id => savedIds[id]).length;
  const filteredPromotions = getFilteredPromotions();

  const urgentCount = useMemo(() => {
    return allPromotions.filter(p => p.isUrgent || isExpiringText(p.expiryText)).length;
  }, [allPromotions, isExpiringText]);

  const nearbyCount = useMemo(() => {
    return allPromotions.filter(p => p.promotionType === 'nearby' || p.distance).length;
  }, [allPromotions]);

  const unlockableCount = useMemo(() => {
    return allPromotions.filter(p => p.unlockCondition && !unlockedPromoIds.includes(p.id) && (p.unlockProgress ?? 0) >= (p.unlockTarget ?? 1)).length;
  }, [allPromotions, unlockedPromoIds]);

  return (
    <div className="min-h-screen text-[#261812] bg-[#fff8f6] antialiased relative pb-4">
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
                  Promotions
                </span>
                <span className="text-sm font-extrabold text-[#a23f00] leading-none">
                  MCOM Mall
                </span>
              </div>
            </div>
            <button
              onClick={() => showToast(urgentCount > 0 ? `${urgentCount} promotion${urgentCount > 1 ? 's' : ''} expiring soon!` : 'No urgent promotions', urgentCount > 0 ? 'error' : 'info')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#ffeae1] transition-all active:scale-95 relative"
            >
              <Sparkles className="w-5 h-5 text-[#a23f00]" />
              {urgentCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] text-white text-[7px] font-black rounded-full flex items-center justify-center">
                  {urgentCount}
                </span>
              )}
            </button>
          </div>

          {/* --- Seasonal Campaign Banner --- */}
          <section className="mb-4 overflow-hidden">
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
              {allPromotions.filter(p => p.promotionType === 'seasonal').map(promo => (
                <div
                  key={promo.id}
                  onClick={() => { setSelectedPromoId(promo.id); setSubView('details'); }}
                  className="flex-shrink-0 w-64 relative overflow-hidden rounded-2xl cursor-pointer group active:scale-[0.97] transition-transform"
                >
                  <div className="h-24 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-4 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-8 -mt-8 blur-xl pointer-events-none" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/80">
                      {promo.campaignName || 'Seasonal'}
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-white leading-tight">{promo.title}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-white">
                        {promo.benefitValue}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- Stats Banner --- */}
          <section className="mb-5">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#a23f00] via-[#ff6904] to-[#ff9969] p-6 text-white shadow-[0px_10px_30px_rgba(252,103,0,0.12)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                  Active Promotions
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-[40px] font-extrabold leading-none">
                    {allPromotions.length}
                  </span>
                  <span className="text-base font-semibold opacity-80">offers</span>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-lg font-bold">{urgentCount}</span>
                    <p className="text-[10px] font-medium opacity-80">Expiring</p>
                  </div>
                  <div className="border-l border-white/20 pl-2">
                    <span className="text-lg font-bold">{nearbyCount}</span>
                    <p className="text-[10px] font-medium opacity-80">Nearby</p>
                  </div>
                  <div className="border-l border-white/20 pl-2">
                    <span className="text-lg font-bold">{savedCount}</span>
                    <p className="text-[10px] font-medium opacity-80">Saved</p>
                  </div>
                  <div className="border-l border-white/20 pl-2">
                    <span className="text-lg font-bold">{unlockableCount}</span>
                    <p className="text-[10px] font-medium opacity-80">Unlockable</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* --- Quick Stats Widget --- */}
          <section className="mb-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-[#e2bfb0]/30 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-[#5a4136] uppercase tracking-wider">Flash Deals</p>
                  <p className="text-lg font-extrabold text-[#261812]">{allPromotions.filter(p => p.promotionType === 'flash').length}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-[#e2bfb0]/30 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <MapPinned className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-[#5a4136] uppercase tracking-wider">Nearby</p>
                  <p className="text-lg font-extrabold text-[#261812]">{nearbyCount}</p>
                </div>
              </div>
            </div>
          </section>

          {/* --- Unlockable Alerts --- */}
          {unlockableCount > 0 && (
            <section className="mb-5">
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/50 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Rewards Ready</p>
                    <p className="text-xs font-semibold text-[#261812]">{unlockableCount} reward{unlockableCount > 1 ? 's' : ''} ready to unlock!</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-600" />
              </div>
            </section>
          )}

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

          {/* --- Borough Filter Chips --- */}
          {activeTab === 'borough' && (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar mt-3">
              {knownBoroughs.map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBoroughFilter(b)}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all',
                    selectedBoroughFilter === b
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100',
                  )}
                >
                  {b === 'all' ? 'All Boroughs' : b}
                </button>
              ))}
            </div>
          )}

          {/* --- Nearby Map Toggle --- */}
          {activeTab === 'nearby' && (
            <div className="flex items-center justify-between mt-3 mb-1">
              <span className="text-[10px] font-bold text-[#5a4136]">
                {nearbyCount} offer{nearbyCount !== 1 ? 's' : ''} nearby
              </span>
              <button
                onClick={() => setShowNearbyMap(!showNearbyMap)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all',
                  showNearbyMap ? 'bg-[#a23f00] text-white' : 'bg-[#ffeae1] text-[#5a4136]',
                )}
              >
                <MapPinned className="w-3.5 h-3.5" />
                {showNearbyMap ? 'List' : 'Map'}
              </button>
            </div>
          )}
          {activeTab === 'nearby' && showNearbyMap && (
            <div className="bg-white rounded-2xl border border-[#e2bfb0]/30 overflow-hidden shadow-sm">
              <div className="relative w-full h-64 bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                <div className="absolute inset-0 opacity-10">
                  <div className="w-full h-full" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, #a23f00 1px, transparent 1px), radial-gradient(circle at 50% 30%, #a23f00 1px, transparent 1px), radial-gradient(circle at 70% 60%, #a23f00 1px, transparent 1px), radial-gradient(circle at 30% 80%, #a23f00 1px, transparent 1px)',
                    backgroundSize: '40px 40px, 60px 60px, 50px 50px, 45px 45px',
                  }} />
                </div>
                <div className="relative z-10 text-center">
                  <MapPinned className="w-8 h-8 text-[#a23f00] mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#261812]">Promotions Map</p>
                  <p className="text-[10px] text-[#5a4136] mt-1">{filteredPromotions.length} pins loaded</p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center">
                    {filteredPromotions.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm border border-[#e2bfb0]/20">
                        {getPromoIcon(p.badgeIcon, 'w-3 h-3')}
                        <span className="text-[8px] font-bold text-[#261812]">{p.businessName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- Tab Content --- */}
          <div className="mt-4 space-y-4">
            <PromotionGrid
              promotions={filteredPromotions}
              activeTab={activeTab}
              savedIds={savedIds}
              redeemedIds={redeemedIds}
              joinedCampaignIds={joinedCampaignIds}
              unlockedPromoIds={unlockedPromoIds}
              onNavigate={handleNavigateToDetails}
              onRedeem={handleRedeem}
              onToggleSave={toggleSaved}
              onShare={(p) => setShareModalPromo(p)}
              onJoinCampaign={handleJoinCampaign}
              onUnlockClick={(p) => setUnlockModalPromo(p)}
              showToast={showToast}
            />
          </div>
        </div>
      )}

      {/* ===== DETAILS VIEW ===== */}
      {subView === 'details' && (
        <PromotionDetailsView
          promo={selectedPromo}
          isSaved={isSelectedSaved}
          isRedeemed={isSelectedRedeemed}
          isJoined={isSelectedJoined}
          isUnlocked={isSelectedUnlocked}
          isCampaign={isCampaignPromo}
          hasUnlockCondition={hasUnlockCondition}
          onBack={() => setSubView('dashboard')}
          onRedeem={() => handleRedeem(selectedPromo)}
          onToggleSave={(e) => toggleSaved(selectedPromo.id, e)}
          onShare={() => setShareModalPromo(selectedPromo)}
          onJoinCampaign={() => handleJoinCampaign(selectedPromo)}
          onShowTerms={() => setTermsModalPromo(selectedPromo)}
          onUnlock={() => setUnlockModalPromo(selectedPromo)}
          showToast={showToast}
        />
      )}

      {/* ===== SCAN CONFIRMATION ===== */}
      {scanConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setScanConfirm(null)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 text-center space-y-5" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="font-extrabold text-[#261812] text-base">Promotion Activated!</h3>
            <p className="text-sm text-[#5a4136]">
              {scanConfirm.title} at <strong>{scanConfirm.businessName}</strong> is ready to use.
            </p>
            <p className="text-[10px] text-[#8e7164] font-medium">
              Show this confirmation at the counter
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

      {/* ===== SHARE MODAL ===== */}
      {shareModalPromo && (
        <ShareModal
          onClose={() => setShareModalPromo(null)}
          promoTitle={shareModalPromo.title}
        />
      )}

      {/* ===== TERMS MODAL ===== */}
      {termsModalPromo && (
        <TermsModal
          onClose={() => setTermsModalPromo(null)}
          terms={termsModalPromo.termsAndConditions ?? 'Standard terms and conditions apply. See store for full details.'}
        />
      )}

      {/* ===== QR SCANNER ===== */}
      {showQrScanner && (
        <QrScannerModal
          onClose={() => setShowQrScanner(false)}
          onScanResult={handleQrScanResult}
        />
      )}

      {/* ===== UNLOCK MODAL ===== */}
      {unlockModalPromo && (
        <UnlockRewardModal
          promo={unlockModalPromo}
          onClose={() => setUnlockModalPromo(null)}
          onUnlock={() => handleUnlock(unlockModalPromo)}
        />
      )}

      {/* ===== FAB: Scan QR ===== */}
      <button
        onClick={() => setShowQrScanner(true)}
        className="fixed right-5 bottom-24 w-14 h-14 bg-[#a23f00] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-90 transition-all z-40"
      >
        <Scan className="w-6 h-6" />
      </button>

      {/* ===== CODE INPUT ===== */}
      <div className="mt-6" style={{ marginBottom: '5rem' }}>
        <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(136,115,106,0.08)] border border-[#e2bfb0]/30 p-4 flex items-center gap-2 backdrop-blur-sm">
          <input
            type="text"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value.toUpperCase())}
            placeholder="Enter promo code..."
            className="flex-1 px-3 py-2 rounded-xl border border-[#e2bfb0] text-xs font-medium text-[#261812] bg-[#fff8f6] placeholder:text-[#8e7164] focus:outline-none focus:ring-2 focus:ring-[#a23f00]/20 focus:border-[#a23f00] transition-all"
          />
          <button
            onClick={() => {
              const trimmed = codeInput.trim().toUpperCase();
              const match = Object.values(PROMOTIONS_MOCK_DATA).find(p => p.redeemCode === trimmed);
              if (match) {
                handleRedeem(match);
                setCodeResult({ success: true, message: `Promo "${match.title}" activated!` });
                setCodeInput('');
              } else {
                setCodeResult({ success: false, message: 'Invalid promo code.' });
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
        <p className="mt-2 text-[8px] text-[#8e7164] text-center font-medium">
          Try codes: BURGER50, BOGOCOFFEE
        </p>
      </div>
    </div>
  );
};

/* ====== PROMOTION GRID ====== */
function PromotionGrid({
  promotions,
  activeTab,
  savedIds,
  redeemedIds,
  joinedCampaignIds,
  unlockedPromoIds,
  onNavigate,
  onRedeem,
  onToggleSave,
  onShare,
  onJoinCampaign,
  onUnlockClick,
  showToast,
}: {
  promotions: PromotionItem[];
  activeTab: PromotionsTab;
  savedIds: Record<string, boolean>;
  redeemedIds: string[];
  joinedCampaignIds: string[];
  unlockedPromoIds: string[];
  onNavigate: (id: string) => void;
  onRedeem: (p: PromotionItem) => void;
  onToggleSave: (id: string, e?: React.MouseEvent) => void;
  onShare: (p: PromotionItem) => void;
  onJoinCampaign: (p: PromotionItem) => void;
  onUnlockClick: (p: PromotionItem) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  if (promotions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-[#f8ddd2] rounded-full flex items-center justify-center mb-4">
          {activeTab === 'saved' ? (
            <Bookmark className="w-10 h-10 text-[#8e7164]" />
          ) : (
            <Tag className="w-10 h-10 text-[#8e7164]" />
          )}
        </div>
        <h3 className="font-bold text-[#261812] mb-1">
          {activeTab === 'saved' && 'No saved promotions'}
          {activeTab === 'nearby' && 'No nearby offers'}
          {activeTab === 'flash' && 'No flash deals right now'}
          {activeTab === 'borough' && 'No borough promotions'}
          {activeTab === 'expiring' && 'No expiring promotions'}
          {activeTab === 'all' && 'No promotions available'}
        </h3>
        <p className="text-sm text-[#5a4136] max-w-xs">
          {activeTab === 'saved' && 'Save promotions you like to view them here.'}
          {activeTab === 'nearby' && 'Enable location services to discover nearby deals.'}
          {activeTab === 'flash' && 'Check back soon for limited-time flash deals.'}
          {activeTab === 'borough' && 'Explore borough-specific offers from local businesses.'}
          {activeTab === 'expiring' && 'No promotions are expiring soon.'}
          {activeTab === 'all' && 'New promotions will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {promotions.map(promo => {
        const isSaved = !!savedIds[promo.id];
        const isRedeemed = redeemedIds.includes(promo.id);
        const isJoined = joinedCampaignIds.includes(promo.id);
        const isUnlocked = unlockedPromoIds.includes(promo.id);
        const isUnlockable = !!promo.unlockCondition && !isUnlocked && !isRedeemed;

        if (activeTab === 'expiring') {
          return (
            <ExpiringPromoCard
              key={promo.id}
              promo={promo}
              isSaved={isSaved}
              onToggleSave={(e) => onToggleSave(promo.id, e)}
              onRedeem={() => onRedeem(promo)}
            />
          );
        }

        if (activeTab === 'nearby') {
          return (
            <NearbyPromoCard
              key={promo.id}
              promo={promo}
              isSaved={isSaved}
              isRedeemed={isRedeemed}
              onClick={() => onNavigate(promo.id)}
              onRedeem={(e) => { e.stopPropagation(); onRedeem(promo); }}
              onToggleSave={(e) => onToggleSave(promo.id, e)}
            />
          );
        }

        return (
          <PromoCard
            key={promo.id}
            promo={promo}
            isSaved={isSaved}
            isRedeemed={isRedeemed}
            isJoined={isJoined}
            isUnlockable={isUnlockable}
            isUnlocked={isUnlocked}
            onClick={() => onNavigate(promo.id)}
            onRedeem={(e) => { e.stopPropagation(); onRedeem(promo); }}
            onToggleSave={(e) => onToggleSave(promo.id, e)}
            onShare={(e) => { e.stopPropagation(); onShare(promo); }}
            onJoinCampaign={(e) => { e.stopPropagation(); onJoinCampaign(promo); }}
            onUnlockClick={(e) => { e.stopPropagation(); onUnlockClick(promo); }}
            showToast={showToast}
          />
        );
      })}
    </div>
  );
}

/* ====== PROMO CARD ====== */
function PromoCard({
  promo,
  isSaved,
  isRedeemed,
  isJoined,
  isUnlockable,
  isUnlocked,
  onClick,
  onRedeem,
  onToggleSave,
  onShare,
  onJoinCampaign,
  onUnlockClick,
  showToast,
}: {
  promo: PromotionItem;
  isSaved: boolean;
  isRedeemed: boolean;
  isJoined: boolean;
  isUnlockable: boolean;
  isUnlocked: boolean;
  onClick: () => void;
  onRedeem: (e: React.MouseEvent) => void;
  onToggleSave: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onJoinCampaign: (e: React.MouseEvent) => void;
  onUnlockClick: (e: React.MouseEvent) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const isCampaign = promo.campaignName !== undefined;
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-[20px] overflow-hidden shadow-[0px_4px_20px_rgba(136,115,106,0.08)] flex flex-col border border-[#e2bfb0]/30 group hover:shadow-md transition-all cursor-pointer',
        isRedeemed && 'opacity-60 grayscale',
        promo.isHot && 'ring-2 ring-[#ff9969]/50',
      )}
    >
      <div className="h-36 relative bg-[#f8ddd2] shrink-0">
        {promo.image ? (
          <img alt={promo.title} className="w-full h-full object-cover" src={promo.image} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getPromoIcon(promo.badgeIcon, 'w-12 h-12 opacity-40')}
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1 flex-wrap justify-end">
          <PromotionTypeBadge type={promo.promotionType} />
          {promo.isHot && (
            <span className="bg-[#ff9969] text-white px-2.5 py-1 rounded-full text-[8px] font-black uppercase shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Hot
            </span>
          )}
        </div>
        <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
          {promo.benefitValue && (
            <span className="bg-[#a23f00]/90 text-white px-2.5 py-1 rounded-full text-[8px] font-black shadow-sm">
              {promo.benefitValue}
            </span>
          )}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-[#261812] text-sm leading-tight truncate">{promo.title}</h3>
              <p className="text-[11px] font-semibold text-[#5a4136] mt-0.5">{promo.businessName}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={onShare}>
                <Share2 className="w-3.5 h-3.5 text-[#8e7164] hover:text-[#a23f00]" />
              </button>
              <button onClick={onToggleSave}>
                <Bookmark className={cn('w-4 h-4', isSaved ? 'fill-[#a23f00] text-[#a23f00]' : 'text-[#8e7164]')} />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[#5a4136] leading-relaxed mb-3 line-clamp-2">{promo.description}</p>
          {promo.locationTag && (
            <div className="flex items-center gap-1 text-[9px] font-medium text-[#8e7164] mb-2">
              <MapPin className="w-3 h-3" />
              <span>{promo.locationTag}</span>
            </div>
          )}
          {promo.campaignName && !isRedeemed && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full mb-2">
              <PartyPopper className="w-3 h-3" />
              {promo.campaignName}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[#f8ddd2] mt-auto">
          <div className={cn(
            'flex items-center gap-1 text-[10px] font-bold',
            promo.isUrgent ? 'text-[#ba1a1a]' : 'text-[#8e7164]',
          )}>
            <Clock className="w-3.5 h-3.5" />
            <ExpiryDisplay expiresAt={promo.expiresAt} expiryText={promo.expiryText} isUrgent={promo.isUrgent} />
          </div>
          <div className="flex gap-1.5">
            {isUnlockable && !isRedeemed && (
              <button
                onClick={onUnlockClick}
                className="px-3 py-2 rounded-xl text-[9px] font-bold bg-amber-500 text-white shadow-sm active:scale-95 transition-all flex items-center gap-1"
              >
                <Trophy className="w-3 h-3" />
                Unlock
              </button>
            )}
            {isCampaign && !isRedeemed && !isUnlockable && (
              <button
                onClick={onJoinCampaign}
                className={cn(
                  'px-3 py-2 rounded-xl text-[9px] font-bold transition-all active:scale-95',
                  isJoined
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-purple-600 text-white shadow-sm',
                )}
              >
                {isJoined ? 'Joined' : 'Join'}
              </button>
            )}
            {isRedeemed ? (
              <div className="bg-[#f8ddd2] text-[#5a4136] px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Used
              </div>
            ) : (
              <button
                onClick={onRedeem}
                className="bg-[#a23f00] hover:bg-[#7b2f00] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold active:scale-95 transition-transform"
              >
                Redeem
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== EXPIRING PROMO CARD ====== */
function ExpiringPromoCard({
  promo,
  isSaved,
  onToggleSave,
  onRedeem,
}: {
  promo: PromotionItem;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
  onRedeem: () => void;
}) {
  const isUrgent = promo.isUrgent;
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
          {promo.image ? (
            <img alt={promo.title} className="w-full h-full object-cover" src={promo.image} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getPromoIcon(promo.badgeIcon, 'w-8 h-8 opacity-40')}
            </div>
          )}
          {isUrgent && <div className="absolute inset-0 bg-[#ba1a1a]/10" />}
          <div className="absolute bottom-1 left-1">
            <PromotionTypeBadge type={promo.promotionType} />
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start gap-1 flex-wrap">
              <h3 className="text-sm font-bold text-[#261812] leading-tight truncate min-w-0">{promo.title}</h3>
              {isUrgent && (
                <span className="bg-[#ba1a1a] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                  Expires Soon
                </span>
              )}
              <button onClick={onToggleSave} className="ml-auto shrink-0">
                <Bookmark className={cn('w-3.5 h-3.5', isSaved ? 'fill-[#a23f00] text-[#a23f00]' : 'text-[#8e7164]')} />
              </button>
            </div>
            <p className="text-[11px] text-[#5a4136] mt-0.5">{promo.businessName}</p>
            <p className="text-[11px] text-[#8e7164] mt-0.5 line-clamp-1">{promo.description}</p>
            {promo.benefitValue && (
              <span className="inline-block mt-1 bg-[#a23f00]/10 text-[#a23f00] text-[9px] font-bold px-2 py-0.5 rounded-full">
                {promo.benefitValue}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              <Clock className={cn('w-3.5 h-3.5', isUrgent ? 'text-[#ba1a1a]' : 'text-[#8e7164]')} />
              <span className={cn('text-[11px] font-bold', isUrgent ? 'text-[#ba1a1a]' : 'text-[#5a4136]')}>
                <ExpiryDisplay expiresAt={promo.expiresAt} expiryText={promo.expiryText} isUrgent={promo.isUrgent} />
              </span>
            </div>
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
      </div>
    </div>
  );
}

/* ====== NEARBY PROMO CARD ====== */
function NearbyPromoCard({
  promo,
  isSaved,
  isRedeemed,
  onClick,
  onRedeem,
  onToggleSave,
}: {
  promo: PromotionItem;
  isSaved: boolean;
  isRedeemed: boolean;
  onClick: () => void;
  onRedeem: (e: React.MouseEvent) => void;
  onToggleSave: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-[20px] overflow-hidden shadow-[0px_4px_20px_rgba(136,115,106,0.08)] flex flex-col border border-[#e2bfb0]/30 group hover:shadow-md transition-all cursor-pointer',
        isRedeemed && 'opacity-60 grayscale',
      )}
    >
      <div className="flex p-4 gap-4">
        <div className="w-16 h-16 rounded-xl shrink-0 overflow-hidden bg-emerald-50 relative flex items-center justify-center">
          {promo.image ? (
            <img alt={promo.title} className="w-full h-full object-cover" src={promo.image} />
          ) : (
            getPromoIcon(promo.badgeIcon, 'w-7 h-7 text-emerald-600')
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-[#261812] leading-tight truncate">{promo.title}</h3>
              <p className="text-[10px] font-semibold text-[#5a4136]">{promo.businessName}</p>
            </div>
            <button onClick={onToggleSave} className="shrink-0">
              <Bookmark className={cn('w-3.5 h-3.5', isSaved ? 'fill-[#a23f00] text-[#a23f00]' : 'text-[#8e7164]')} />
            </button>
          </div>
          <p className="text-[10px] text-[#5a4136] mt-1 line-clamp-1">{promo.description}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {promo.distance && <DistanceBadge distance={promo.distance} />}
            {promo.benefitValue && (
              <span className="text-[10px] font-bold text-[#a23f00]">{promo.benefitValue}</span>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] font-bold text-[#8e7164]">
          <Clock className="w-3.5 h-3.5" />
          <ExpiryDisplay expiresAt={promo.expiresAt} expiryText={promo.expiryText} />
        </div>
        {isRedeemed ? (
          <div className="bg-[#f8ddd2] text-[#5a4136] px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Used
          </div>
        ) : (
          <button
            onClick={onRedeem}
            className="bg-[#a23f00] hover:bg-[#7b2f00] text-white px-5 py-2 rounded-xl text-[10px] font-bold active:scale-95 transition-transform"
          >
            Redeem
          </button>
        )}
      </div>
    </div>
  );
}

/* ====== PROMOTION DETAILS VIEW ====== */
function PromotionDetailsView({
  promo,
  isSaved,
  isRedeemed,
  isJoined,
  isUnlocked,
  isCampaign,
  hasUnlockCondition,
  onBack,
  onRedeem,
  onToggleSave,
  onShare,
  onJoinCampaign,
  onShowTerms,
  onUnlock,
  showToast,
}: {
  promo: PromotionItem;
  isSaved: boolean;
  isRedeemed: boolean;
  isJoined: boolean;
  isUnlocked: boolean;
  isCampaign: boolean;
  hasUnlockCondition: boolean;
  onBack: () => void;
  onRedeem: () => void;
  onToggleSave: (e: React.MouseEvent) => void;
  onShare: () => void;
  onJoinCampaign: () => void;
  onShowTerms: () => void;
  onUnlock: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const isUnlockReady = (promo.unlockProgress ?? 0) >= (promo.unlockTarget ?? 1) && !isUnlocked;

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
          <h1 className="font-extrabold text-[#261812] text-sm truncate max-w-[180px]">{promo.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onToggleSave} className="p-2 hover:bg-[#ffeae1] border border-[#e2bfb0] rounded-xl transition-all active:scale-90">
            <Bookmark className={cn('w-4 h-4', isSaved ? 'fill-[#a23f00] text-[#a23f00]' : 'text-[#8e7164]')} />
          </button>
          <button onClick={onShare} className="p-2 hover:bg-[#ffeae1] border border-[#e2bfb0] rounded-xl transition-all active:scale-90">
            <Share2 className="w-4 h-4 text-[#8e7164]" />
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="relative w-full h-[260px] overflow-hidden rounded-3xl border border-[#e2bfb0]/30 shadow-md">
        {promo.image ? (
          <img alt={promo.title} className="w-full h-full object-cover" src={promo.image} />
        ) : (
          <div className="w-full h-full bg-[#f8ddd2] flex items-center justify-center">
            {getPromoIcon(promo.badgeIcon, 'w-16 h-16 opacity-40')}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ff6904]/90 text-white text-[8px] font-black uppercase tracking-wider mb-2">
            <PromotionTypeBadge type={promo.promotionType} />
            {promo.benefitValue}
          </span>
          <h2 className="text-xl font-black text-white">{promo.title}</h2>
          <p className="text-sm text-white/80">{promo.businessName}</p>
        </div>
      </section>

      {/* Info */}
      <div className="bg-white rounded-3xl p-5 border border-[#e2bfb0]/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#f8ddd2] flex items-center justify-center">
              {getPromoIcon(promo.badgeIcon, 'w-6 h-6')}
            </div>
            <div>
              <p className="text-xs font-bold text-[#261812]">{promo.businessName}</p>
              {promo.locationTag && (
                <p className="text-[9px] font-medium text-[#8e7164] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {promo.locationTag}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold text-[#a23f00]">{promo.benefitValue}</p>
            <p className={cn(
              'text-[9px] font-bold flex items-center gap-1 mt-0.5 justify-end',
              promo.isUrgent ? 'text-[#ba1a1a]' : 'text-[#5a4136]',
            )}>
              <Clock className="w-3 h-3" />
              <ExpiryDisplay expiresAt={promo.expiresAt} expiryText={promo.expiryText} isUrgent={promo.isUrgent} />
            </p>
          </div>
        </div>
        <div className="h-px bg-[#f8ddd2]" />
        <p className="text-xs text-[#5a4136] leading-relaxed">{promo.longDescription}</p>
      </div>

      {/* Unlock Section */}
      {hasUnlockCondition && (
        <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200/50 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <Trophy className="w-5 h-5 text-emerald-600" />
            ) : (
              <Lock className="w-5 h-5 text-amber-600" />
            )}
            <span className="text-xs font-bold text-[#261812]">
              {isUnlocked ? 'Reward Unlocked!' : 'Unlockable Reward'}
            </span>
          </div>
          <p className="text-[10px] text-[#5a4136]">{promo.unlockCondition}</p>
          {promo.unlockRewardDescription && (
            <p className="text-[10px] font-bold text-amber-700 bg-amber-100 px-3 py-2 rounded-xl">
              Reward: {promo.unlockRewardDescription}
            </p>
          )}
          {!isUnlocked && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-[#5a4136]">
                <span>Progress</span>
                <span className={isUnlockReady ? 'text-emerald-600' : 'text-[#a23f00]'}>
                  {promo.unlockProgress ?? 0} / {promo.unlockTarget ?? 1}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#f8ddd2] rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', isUnlockReady ? 'bg-emerald-500' : 'bg-amber-500')}
                  style={{ width: `${Math.min(((promo.unlockProgress ?? 0) / (promo.unlockTarget ?? 1)) * 100, 100)}%` }}
                />
              </div>
              {isUnlockReady && (
                <button
                  onClick={onUnlock}
                  className="w-full py-3 bg-amber-600 text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  Unlock Reward
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Bookmark, label: isSaved ? 'Saved' : 'Save', onClick: onToggleSave, color: isSaved ? 'text-red-500' : 'text-[#a23f00]' },
          { icon: Share2, label: 'Share', onClick: onShare, color: 'text-[#a23f00]' },
          { icon: MapPin, label: 'Directions', onClick: () => showToast('Directions feature coming soon!', 'info'), color: 'text-[#a23f00]' },
          { icon: Info, label: 'Terms', onClick: onShowTerms, color: 'text-[#a23f00]' },
          ...(isCampaign ? [{ icon: PartyPopper, label: isJoined ? 'Joined' : 'Join Campaign', onClick: onJoinCampaign, color: isJoined ? 'text-emerald-600' : 'text-purple-600' as const }] : []),
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

      {/* QR / Redeem Section */}
      <div className="bg-white rounded-3xl p-5 border border-[#e2bfb0]/30 shadow-sm flex flex-col items-center text-center gap-4">
        <p className="text-xs font-bold text-[#261812]">Redemption Code</p>
        <div className="bg-white p-4 rounded-2xl border-2 border-[#a23f00]/10 relative w-full max-w-[200px]">
          <img
            alt="QR Code"
            className={cn(
              'w-full select-none pointer-events-none transition-all duration-500',
              isRedeemed ? 'opacity-100 blur-0' : 'opacity-30 blur-[2px]',
            )}
            src="https://lh3.googleusercontent.com/aida/AP1WRLuBrrLwVCEqPp8totEq6B-Ccmw69aJ3jmFcABXdbgpH2L2hfkVTfsFJnIeUQ5iU-MjZomqpC2cmUZE7sH-6SxYHxqJgcpj6XHO6W5yYXESiA621CTVy_rhaE_TPgQFFZ8QpxylFY79rk49v4bEFlSpD8KWWHAahHHJr8tPQLXenATDNFKRAaULtaw6jH6MzmkQR4RSsXQYtVEoKTlCW_lMAzNuKXyv8MME5flg02_q4FWa_Coy4BcvF_cGn"
          />
          {!isRedeemed && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
              <div
                onClick={onRedeem}
                className="w-10 h-10 rounded-full bg-[#a23f00] text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-90 transition-transform"
              >
                <Lock className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
        <p className="text-[9px] text-[#8e7164] font-bold uppercase tracking-wider">
          {isRedeemed ? 'Already Redeemed' : 'Tap to unlock & redeem'}
        </p>
      </div>

      {/* Campaign Info */}
      {promo.campaignName && (
        <div className="bg-white p-5 rounded-3xl border border-[#e2bfb0]/30 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 font-bold text-xs text-[#261812]">
            <PartyPopper className="w-4 h-4 text-purple-600" />
            <span>Campaign: {promo.campaignName}</span>
          </div>
          {promo.usageLimit && (
            <div className="flex justify-between text-[10px] font-medium text-[#5a4136]">
              <span>Redemption limit</span>
              <span className="font-bold text-[#a23f00]">{promo.usageCount ?? 0} / {promo.usageLimit} used</span>
            </div>
          )}
          {promo.usageLimit && (
            <div className="w-full h-2 bg-[#f8ddd2] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#a23f00] rounded-full"
                style={{ width: `${Math.min(((promo.usageCount ?? 0) / promo.usageLimit) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile CTA */}
      <footer className="fixed bottom-0 left-0 w-full z-40 px-5 py-4 bg-white/95 backdrop-blur-md border-t border-[#e2bfb0]/30 md:hidden">
        <div className="max-w-md mx-auto">
          {isRedeemed ? (
            <div className="bg-[#f8ddd2] text-[#5a4136] font-bold text-xs py-4 rounded-full flex items-center justify-center gap-2">
              PROMOTION REDEEMED <Check className="w-4 h-4" />
            </div>
          ) : (
            <div className="flex gap-2">
              {isCampaign && !isJoined && (
                <button
                  onClick={onJoinCampaign}
                  className="flex-1 bg-purple-600 text-white font-bold text-xs py-4 rounded-full shadow-lg active:scale-95 transition-all"
                >
                  JOIN CAMPAIGN
                </button>
              )}
              <button
                onClick={onRedeem}
                className={cn(
                  'font-bold text-xs py-4 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2',
                  isCampaign && !isJoined ? 'flex-1 bg-[#a23f00] hover:bg-[#7b2f00] text-white' : 'w-full bg-[#a23f00] hover:bg-[#7b2f00] text-white',
                )}
              >
                REDEEM NOW <Zap className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

export default PromotionsView;
