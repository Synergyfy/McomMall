'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Calendar, MapPin, Clock, Users, Check, Share2, Heart, QrCode,
  BookmarkPlus, Download, Sparkles, TrendingUp, Radio, Building2,
  Compass, X, Scan, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDiscoverEvents, DiscoverEvent } from '@/hooks/useDiscover';

/* ====== TYPES ====== */

interface EventItem {
  id: string;
  title: string;
  date: string;
  dateObj: Date;
  time: string;
  endTime?: string;
  location: string;
  borough: string;
  attendees: number;
  description: string;
  image: string;
  category: 'workshop' | 'tasting' | 'competition' | 'live_music' | 'kids' | 'fitness';
  lat?: number;
  lng?: number;
}

type EventsTab = 'upcoming' | 'nearby' | 'borough' | 'joined' | 'live' | 'recommended';

/* ====== CONFIG ====== */

const TABS: { id: EventsTab; label: string; icon: React.ElementType }[] = [
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'nearby', label: 'Nearby', icon: Compass },
  { id: 'borough', label: 'Borough', icon: Building2 },
  { id: 'joined', label: 'Joined', icon: Check },
  { id: 'live', label: 'Live', icon: Radio },
  { id: 'recommended', label: 'Recommended', icon: Sparkles },
];

const CATEGORY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  workshop: { label: 'Workshop', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  tasting: { label: 'Tasting', bg: 'bg-amber-100', text: 'text-amber-700' },
  competition: { label: 'Competition', bg: 'bg-rose-100', text: 'text-rose-700' },
  live_music: { label: 'Live Music', bg: 'bg-purple-100', text: 'text-purple-700' },
  kids: { label: 'Kids', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  fitness: { label: 'Fitness', bg: 'bg-cyan-100', text: 'text-cyan-700' },
};

const BOROUGHS = ['All', 'Camden Town', 'Shoreditch', 'Greenwich', 'Notting Hill', 'Brixton', 'Manhattan'];

/* ====== MOCK DATA ====== */

const today = new Date();
const day = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d;
};
const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

const ITEMS_PER_PAGE = 6;

/* ====== COMPONENT ====== */

export const EventsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EventsTab>('upcoming');
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [selectedBorough, setSelectedBorough] = useState('All');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  const { data: apiEvents, loading: eventsLoading } = useDiscoverEvents({
    tab: activeTab,
    lat: position?.lat,
    lng: position?.lng,
    borough: selectedBorough !== 'All' ? selectedBorough : undefined,
    joinedIds: joinedEventIds.length > 0 ? joinedEventIds.join(',') : undefined,
    savedIds: savedEventIds.length > 0 ? savedEventIds.join(',') : undefined,
    limit: 20,
  });

  const events = useMemo(() => {
    if (!apiEvents?.items) return [];
    return apiEvents.items.map(e => ({
      id: e.id,
      title: e.title,
      date: new Date(e.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      dateObj: new Date(e.startDate),
      time: new Date(e.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      endTime: e.endDate ? new Date(e.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : undefined,
      location: e.location || e.business?.businessName || 'Location TBD',
      borough: e.borough || 'Manhattan',
      attendees: e.attendees || 0,
      description: e.description || '',
      image: e.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
      category: (e.category || 'workshop') as EventItem['category'],
      lat: e.latitude,
      lng: e.longitude,
    }));
  }, [apiEvents]);

  /* ====== Geolocation ====== */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: false, timeout: 5000 },
      );
    }
  }, []);

  /* ====== Load saved IDs from localStorage ====== */
  useEffect(() => {
    const saved = localStorage.getItem('eventsSavedIds');
    if (saved) setSavedEventIds(JSON.parse(saved));
    const joined = localStorage.getItem('eventsJoinedIds');
    if (joined) setJoinedEventIds(JSON.parse(joined));
  }, []);

  const persistSaved = (ids: string[]) => localStorage.setItem('eventsSavedIds', JSON.stringify(ids));
  const persistJoined = (ids: string[]) => localStorage.setItem('eventsJoinedIds', JSON.stringify(ids));

  const showToast = useCallback((message: string, type: string = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2500);
  }, []);

  const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  /* ====== Filtered events ====== */
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    switch (activeTab) {
      case 'live': {
        const todayStr = fmtDate(today);
        filtered = filtered.filter(e => e.date === todayStr);
        break;
      }
      case 'joined':
        filtered = filtered.filter(e => joinedEventIds.includes(e.id));
        break;
      case 'borough':
        if (selectedBorough !== 'All') {
          filtered = filtered.filter(e => e.borough === selectedBorough);
        }
        break;
      case 'nearby': {
        if (position) {
          filtered = filtered
            .filter(e => e.lat && e.lng)
            .sort((a, b) => {
              const dA = haversine(position.lat, position.lng, a.lat!, a.lng!);
              const dB = haversine(position.lat, position.lng, b.lat!, b.lng!);
              return dA - dB;
            });
        } else {
          filtered = filtered.filter(e => e.lat && e.lng);
        }
        break;
      }
      case 'recommended':
        filtered = filtered.sort(() => Math.random() - 0.5).slice(0, 4);
        break;
      default:
        filtered = filtered.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
        break;
    }

    return filtered;
  }, [activeTab, joinedEventIds, selectedBorough, position, events]);

  const visibleEvents = filteredEvents.slice(0, visibleCount);

  const handleJoin = useCallback((id: string, title: string) => {
    if (joinedEventIds.includes(id)) {
      const next = joinedEventIds.filter(eid => eid !== id);
      setJoinedEventIds(next);
      persistJoined(next);
      showToast(`Cancelled registration for ${title}`, 'info');
    } else {
      const next = [...joinedEventIds, id];
      setJoinedEventIds(next);
      persistJoined(next);
      showToast(`Successfully registered for ${title}!`, 'success');
    }
  }, [joinedEventIds, showToast]);

  const handleSave = useCallback((id: string, title: string) => {
    if (savedEventIds.includes(id)) {
      const next = savedEventIds.filter(sid => sid !== id);
      setSavedEventIds(next);
      persistSaved(next);
      showToast(`Removed ${title} from saved`, 'info');
    } else {
      const next = [...savedEventIds, id];
      setSavedEventIds(next);
      persistSaved(next);
      showToast(`Saved ${title} to your events!`, 'success');
    }
  }, [savedEventIds, showToast]);

  const handleShare = useCallback((title: string) => {
    navigator.clipboard?.writeText(`Check out this event at MCOM Mall: ${title}`);
    showToast('Link copied!', 'success');
  }, [showToast]);

  const handleAddToCalendar = useCallback((event: EventItem) => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${event.dateObj.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Calendar file downloaded!', 'success');
  }, [showToast]);

  /* ====== QR Scanner ====== */
  const [showScanner, setShowScanner] = useState(false);
  const [scannerStep, setScannerStep] = useState<'scan' | 'result' | 'error'>('scan');
  const [scannedEvent, setScannedEvent] = useState<EventItem | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    if (!showScanner) return;
    setScannerStep('scan');
    setScannedEvent(null);
    let mounted = true;
    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!mounted || !scannerRef.current) return;
        const scanner = new Html5Qrcode('qr-reader-events');
        html5QrCodeRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            const match = events.find(
              e => e.id === decodedText || e.title.toLowerCase().replace(/\s+/g, '-') === decodedText.toLowerCase().replace(/\s+/g, '-')
            );
            if (match && mounted) {
              scanner.stop().catch(() => {});
              setScannedEvent(match);
              setScannerStep('result');
            }
          },
          () => {},
        );
      } catch {
        if (mounted) setScannerStep('error');
      }
    };
    if (showScanner) startScanner();
    return () => { mounted = false; if (html5QrCodeRef.current) html5QrCodeRef.current.stop().catch(() => {}); };
  }, [showScanner]);

  const simulateScan = useCallback(() => {
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    setScannedEvent(randomEvent);
    setScannerStep('result');
  }, [events]);

  return (
    <div className="space-y-5 pb-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Events & Experiences</h3>
          <p className="text-[11px] text-slate-400 font-semibold">Discover happenings across the mall</p>
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#ff6900] text-white rounded-full text-[10px] font-bold shadow-md active:scale-95 transition-transform"
        >
          <Scan className="w-3.5 h-3.5" />
          Scan QR
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={cn(
            'fixed top-20 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-2.5 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-4 duration-200',
            toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'info' ? 'bg-slate-800 text-white' : 'bg-rose-600 text-white',
          )}
        >
          {toast.message}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
        <div className="flex gap-2 pb-2 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setVisibleCount(ITEMS_PER_PAGE); }}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95',
                  activeTab === tab.id
                    ? 'bg-[#ff6900] text-white shadow-md'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Borough filter (Borough tab) ── */}
      {activeTab === 'borough' && (
        <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
          <div className="flex gap-2 pb-1">
            {BOROUGHS.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBorough(b)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all',
                  selectedBorough === b
                    ? 'bg-[#a14000] text-white'
                    : 'bg-white text-slate-500 border border-slate-200',
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {visibleEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Calendar className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-600 mb-1">No events found</p>
          <p className="text-[11px] text-slate-400 font-semibold">
            {activeTab === 'joined'
              ? 'Join an event to see it here!'
              : activeTab === 'live'
              ? 'No events happening today. Check upcoming!'
              : activeTab === 'borough'
              ? 'No events in this borough yet.'
              : 'Check back later for new events.'}
          </p>
        </div>
      )}

      {/* ── Event List ── */}
      <div className="space-y-4">
        {visibleEvents.map((event) => {
          const isJoined = joinedEventIds.includes(event.id);
          const isSaved = savedEventIds.includes(event.id);
          const catCfg = CATEGORY_CONFIG[event.category];
          const isPast = event.dateObj < new Date(new Date().toDateString());

          return (
            <article
              key={event.id}
              className={cn(
                'bg-white rounded-2xl overflow-hidden border shadow-sm flex flex-col sm:flex-row transition-all',
                isPast ? 'border-slate-100 opacity-70' : 'border-slate-100',
              )}
            >
              <div className="relative h-36 sm:h-auto sm:w-48 overflow-hidden shrink-0 bg-gradient-to-br from-slate-100 to-slate-200">
                <img
                  alt={event.title}
                  className="w-full h-full object-cover relative z-0"
                  src={event.image}
                />
                {catCfg && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className={cn('px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider', catCfg.bg, catCfg.text)}>
                      {catCfg.label}
                    </span>
                  </div>
                )}
                {isPast && (
                  <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10">
                    <span className="bg-slate-800/80 text-white text-[10px] font-bold px-3 py-1 rounded-full">Past</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{event.title}</h4>
                    <button
                      onClick={() => handleSave(event.id, event.title)}
                      className="shrink-0 p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <Heart
                        className={cn('w-4 h-4', isSaved ? 'fill-red-500 text-red-500' : 'text-slate-300')}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed line-clamp-2">{event.description}</p>

                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 pt-0.5 text-[10px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{event.time}{event.endTime ? ` - ${event.endTime}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{event.attendees + (isJoined ? 1 : 0)} joined</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleShare(event.title)}
                      className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAddToCalendar(event)}
                      className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
                      title="Add to Calendar"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleJoin(event.id, event.title)}
                      className={cn(
                        'flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95',
                        isJoined
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/10',
                      )}
                    >
                      {isJoined ? (
                        <><Check className="w-3 h-3" /> Registered</>
                      ) : (
                        'Register Now'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Show More ── */}
      {filteredEvents.length > visibleCount && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount(v => v + ITEMS_PER_PAGE)}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-white text-slate-600 rounded-full text-xs font-bold border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            <Layers className="w-4 h-4" />
            Show More ({filteredEvents.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* ── QR Scanner Modal ── */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowScanner(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            {scannerStep === 'scan' && (
              <div className="p-8 text-center space-y-6">
                <div className="w-48 h-48 mx-auto relative">
                  <div id="qr-reader-events" ref={scannerRef} className="w-full h-full" />
                  <div className="absolute inset-0 border-2 border-[#a23f00] rounded-2xl pointer-events-none" />
                  <div className="absolute inset-4 border-2 border-dashed border-[#ff9969]/50 rounded-xl pointer-events-none" />
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#a23f00] rounded-tl-2xl pointer-events-none" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#a23f00] rounded-tr-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#a23f00] rounded-bl-2xl pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#a23f00] rounded-br-2xl pointer-events-none" />
                </div>
                <p className="text-xs font-bold text-[#261812]">Point your camera at an event QR code</p>
                <p className="text-[10px] text-[#8e7164]">Scan event QR codes from posters or screens</p>
                <div className="flex gap-2">
                  <button
                    onClick={simulateScan}
                    className="flex-1 py-3 bg-[#a23f00] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Scan className="w-4 h-4" />
                    Simulate
                  </button>
                  <button
                    onClick={() => setShowScanner(false)}
                    className="py-3 px-4 border border-[#e2bfb0]/30 rounded-2xl text-[10px] font-bold text-[#5a4136] hover:bg-[#ffeae1] active:scale-95 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {scannerStep === 'result' && scannedEvent && (
              <div className="p-6 text-center space-y-5">
                <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="font-extrabold text-[#261812] text-base">Event Found!</h3>
                <div className="bg-[#ffeae1] rounded-2xl p-4 text-left flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#f8ddd2] flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-[#a23f00]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#261812]">{scannedEvent.title}</p>
                    <p className="text-[10px] text-[#5a4136]">{scannedEvent.date} · {scannedEvent.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { handleJoin(scannedEvent.id, scannedEvent.title); setShowScanner(false); }}
                    className="flex-1 py-3 bg-[#a23f00] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md"
                  >
                    Register Now
                  </button>
                  <button
                    onClick={() => setShowScanner(false)}
                    className="flex-1 py-3 border border-[#e2bfb0]/30 rounded-2xl text-[10px] font-bold text-[#5a4136] hover:bg-[#ffeae1] active:scale-95 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            {scannerStep === 'error' && (
              <div className="p-6 text-center space-y-5">
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="font-extrabold text-[#261812] text-base">Camera Unavailable</h3>
                <p className="text-xs text-[#5a4136]">Could not access your camera. Please grant camera permissions or use the Simulate button.</p>
                <div className="flex gap-2">
                  <button onClick={simulateScan} className="flex-1 py-3 bg-[#a23f00] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-md">Simulate Scan</button>
                  <button onClick={() => setShowScanner(false)} className="flex-1 py-3 border border-[#e2bfb0]/30 rounded-2xl text-[10px] font-bold text-[#5a4136]">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
