'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  User,
  Star,
  Heart,
  Bookmark,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

// Static event data (can be replaced with real API call using the `id` param)
const eventData = {
  title: 'Summer Artisans Workshop',
  badge: 'EXCLUSIVE INVITE',
  image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop',
  rewardPoints: 50,
  date: 'Saturday, July 15 • 2:00 PM',
  location: {
    name: 'The Downtown Collective',
    address: '422 Maple Avenue, West Quarter',
  },
  hostedBy: 'Sarah Mitchell',
  about:
    "Join us for an afternoon of creative expression and local craft. We're bringing together our favorite artisans for a hands-on workshop where you'll learn the secrets of sustainable weaving. Complimentary refreshments will be served.",
  attendees: 14,
  avatars: [
    'https://i.pravatar.cc/32?img=1',
    'https://i.pravatar.cc/32?img=2',
    'https://i.pravatar.cc/32?img=3',
  ],
};

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [rsvp, setRsvp] = useState<'going' | 'maybe' | null>(null);
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState('');

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 3000);
  };

  const handleJoin = () => {
    setRsvp('going');
    triggerToast('🎉 You\'re going! 50 bonus points will be added after attendance.');
  };

  const handleMaybe = () => {
    setRsvp('maybe');
    triggerToast('Marked as maybe. We\'ll remind you closer to the date.');
  };

  const handleSave = () => {
    setSaved(!saved);
    triggerToast(saved ? 'Removed from saved.' : 'Event saved to your list!');
  };

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5] text-[#1f1b18]">

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1f1b18] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl max-w-[90vw] text-center"
          >
            {showToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO IMAGE ── */}
      <div className="relative w-full h-64 overflow-hidden">
        <img
          src={eventData.image}
          alt={eventData.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-[#ff6900] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
            {eventData.badge}
          </span>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h1 className="font-black text-2xl leading-tight">{eventData.title}</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 pb-36 space-y-5">

        {/* ── REWARD INCENTIVE BANNER ── */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(161,64,0,0.03)]">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-[#a14000]" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Reward Incentive</p>
            <p className="text-sm font-bold text-[#a14000] mt-0.5">
              Earn {eventData.rewardPoints} bonus points for attending
            </p>
          </div>
        </div>

        {/* ── EVENT DETAILS ── */}
        <div className="bg-white rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(161,64,0,0.03)] divide-y divide-[#f7ece7]">
          {/* Date & Time */}
          <div className="flex items-start gap-4 p-4">
            <div className="w-9 h-9 rounded-full bg-[#fff8f5] flex items-center justify-center shrink-0 mt-0.5">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400">Date & Time</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{eventData.date}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-4 p-4">
            <div className="w-9 h-9 rounded-full bg-[#fff8f5] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-gray-400">Location</p>
                <button className="text-[10px] font-bold text-[#00629f] hover:underline">Map</button>
              </div>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{eventData.location.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{eventData.location.address}</p>
            </div>
          </div>

          {/* Hosted By */}
          <div className="flex items-start gap-4 p-4">
            <div className="w-9 h-9 rounded-full bg-[#fff8f5] flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400">Hosted By</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{eventData.hostedBy}</p>
            </div>
          </div>
        </div>

        {/* ── ABOUT ── */}
        <section className="space-y-2">
          <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider text-[11px]">
            About This Event
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{eventData.about}</p>
        </section>

        {/* ── RSVP SECTION ── */}
        <section className="space-y-4">
          <h3 className="font-bold text-base text-gray-900 text-center">Will you be attending?</h3>

          {/* Join Event CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleJoin}
            className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              rsvp === 'going'
                ? 'bg-green-600 text-white shadow-green-600/20'
                : 'bg-gradient-to-r from-[#a14000] to-[#ea580c] text-white shadow-orange-600/20 hover:opacity-95'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {rsvp === 'going' ? "You're Going! 🎉" : 'Join Event'}
          </motion.button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleMaybe}
              className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all active:scale-95 ${
                rsvp === 'maybe'
                  ? 'border-[#a14000] text-[#a14000] bg-orange-50'
                  : 'border-[#e2bfb0] text-gray-600 bg-white hover:bg-gray-50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Maybe
            </button>
            <button
              onClick={handleSave}
              className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all active:scale-95 ${
                saved
                  ? 'border-[#a14000] text-[#a14000] bg-orange-50'
                  : 'border-[#e2bfb0] text-gray-600 bg-white hover:bg-gray-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[#a14000]' : ''}`} />
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </section>

        {/* ── SOCIAL PROOF ── */}
        <div className="flex items-center gap-3 justify-center">
          <div className="flex -space-x-2">
            {eventData.avatars.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Attendee ${i + 1}`}
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
            ))}
            <div className="w-7 h-7 rounded-full border-2 border-white bg-[#ffdbcc] flex items-center justify-center text-[9px] font-black text-[#a14000]">
              +12
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold">
            {eventData.attendees} customers are going
          </p>
        </div>

      </div>
    </div>
  );
}
