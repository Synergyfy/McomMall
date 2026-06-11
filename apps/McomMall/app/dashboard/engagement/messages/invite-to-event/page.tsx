'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Calendar,
  MapPin,
  User,
  Star,
  CheckCircle,
  HelpCircle,
  Bookmark,
  Share2,
} from 'lucide-react';

export default function EventInvitationPage() {
  const [rsvpState, setRsvpState] = useState<'none' | 'joined' | 'maybe' | 'saved'>('none');
  const [goingCount, setGoingCount] = useState(14);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleRSVP = (state: 'joined' | 'maybe' | 'saved') => {
    if (state === 'joined') {
      if (rsvpState !== 'joined') {
        setGoingCount(15);
        triggerToast("🎉 You're officially going to the Summer Artisans Workshop!");
      }
      setRsvpState('joined');
    } else if (state === 'maybe') {
      if (rsvpState === 'joined') setGoingCount(14);
      setRsvpState('maybe');
      triggerToast("👍 RSVP updated to: Maybe");
    } else if (state === 'saved') {
      if (rsvpState === 'joined') setGoingCount(14);
      setRsvpState('saved');
      triggerToast("💾 Event saved to bookmarks");
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden bg-[#fff8f5] text-[#1f1b18] pb-28">
      <div className="w-full max-w-md mx-auto px-4 pt-5 space-y-5 min-w-0">
        
        {/* ── BACK BUTTON ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/engagement/messages"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Messages
          </Link>
          <button 
            type="button" 
            onClick={() => triggerToast("🔗 Share link copied to clipboard!")}
            className="p-2 hover:bg-orange-100/50 rounded-full text-gray-500 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* ── EVENT BANNER ── */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Summer Artisans Workshop"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida/AP1WRLuFQrYl_5HWtKQHtf01BIpjqftTc6n1O6l8UebcKcnnUIBpshNLKXQABZXdzrYdHcKix8SQAVjzdFbu2ca69bcEEjFDXBaVgV_OOjsuXLL3nGUR6kQtweBQhvEPeah4lcbdEvhZKymFWgkuGlaMAJ220HjniYztVdNpHUBSYIG5ezBpGzY1-UfbSk1fpADWzQTxoaa5Zpo4zer_rJ0Nhkx1W-38OqW5llHFx45u78L9I4GNbRMsOL9iWA"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-block px-2.5 py-0.5 bg-[#ff6904] text-white font-black text-[9px] uppercase tracking-wider rounded-lg mb-2">
              EXCLUSIVE INVITE
            </span>
            <h2 className="font-bold text-xl text-white leading-tight font-display">
              Summer Artisans Workshop
            </h2>
          </div>
        </div>

        {/* ── INCENTIVE CARD ── */}
        <div className="bg-white p-4 rounded-2xl border border-[#e2bfb0]/30 shadow-[0_2px_6px_rgba(161,64,0,0.02)] flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-[#a14000] shrink-0">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Reward Incentive</p>
            <p className="text-xs font-black text-[#a14000] mt-0.5">
              Earn 50 bonus points for attending
            </p>
          </div>
        </div>

        {/* ── DETAILS CARD ── */}
        <div className="bg-white p-5 rounded-2xl border border-[#e2bfb0]/30 shadow-[0_2px_6px_rgba(161,64,0,0.02)] space-y-4">
          <div className="space-y-3.5">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center text-[#a14000] shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Date & Time</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">Saturday, July 15 • 2:00 PM</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center text-[#a14000] shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Location</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">The Downtown Collective</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">422 Maple Avenue, West Quarter</p>
              </div>
              <button 
                type="button"
                onClick={() => triggerToast("🗺️ Opening maps navigation...")}
                className="text-xs font-bold text-[#a14000] underline shrink-0 self-center"
              >
                Map
              </button>
            </div>

            {/* Host */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center text-[#a14000] shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Hosted By</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">Sarah Mitchell</p>
              </div>
            </div>
          </div>

          <hr className="border-[#e2bfb0]/20" />

          {/* About Event Description */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">About This Event</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              Join us for an afternoon of creative expression and local craft. We're bringing together our favorite artisans for a hands-on workshop where you'll learn the secrets of sustainable weaving. Complimentary refreshments will be served.
            </p>
          </div>
        </div>

        {/* ── RSVP CARD ── */}
        <div className="bg-white p-5 rounded-2xl border border-[#e2bfb0]/30 shadow-[0_2px_6px_rgba(161,64,0,0.02)] space-y-4">
          <h3 className="font-bold text-sm text-gray-800">Will you be attending?</h3>
          
          <div className="flex flex-col gap-2">
            {/* Join Event Button */}
            <button
              onClick={() => handleRSVP('joined')}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                rsvpState === 'joined'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/10'
                  : 'bg-gradient-to-r from-[#a14000] to-[#ea580c] text-white shadow-orange-600/10 hover:opacity-95'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {rsvpState === 'joined' ? 'RSVP: Going' : 'Join Event'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* Maybe Button */}
              <button
                onClick={() => handleRSVP('maybe')}
                className={`py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  rsvpState === 'maybe'
                    ? 'border-[#a14000] text-[#a14000] bg-orange-50/50'
                    : 'border-[#e2bfb0] text-gray-700 hover:bg-orange-50/20'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Maybe
              </button>

              {/* Save/Interested Button */}
              <button
                onClick={() => handleRSVP('saved')}
                className={`py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  rsvpState === 'saved'
                    ? 'border-[#a14000] text-[#a14000] bg-orange-50/50'
                    : 'border-[#e2bfb0] text-gray-700 hover:bg-orange-50/20'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#f7ece7]">
            <div className="flex -space-x-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Attendee"
                className="w-7 h-7 rounded-full border border-white shrink-0 object-cover"
                src="https://lh3.googleusercontent.com/aida/AP1WRLsBnzWerHZHfkdg-CwuJioGaQTBb6-rCXtudeTJpx31XjCjRvojPGHVrwE1nY3OZUFN11hirbfhukLlm7wxQ_5VwdNunw6_9Co3yyi0c34O3_gmdsoQd2WPSZxSXa4Ii2BCYcyKlkoI5Jx_idm9o2LIKgw7t-5FB-kxef1bE6oFXRu1xgigk8T5bFPWI3PqjtFWJUZGvDs5SowHkoC-MVjFm8-09r7AXX558vVPmWw_tISLzAujky_RClM"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Attendee"
                className="w-7 h-7 rounded-full border border-white shrink-0 object-cover"
                src="https://lh3.googleusercontent.com/aida/AP1WRLtua57SjEKKHJJ3v4mOi4z_fSw6TFdxHHWKrQeEeookjp35NOPmgrsqGBH3bGKs9e8nA3qVKEXYjHg-vYLws1Udww7vh6hOGQ9pt1E3EUA8ymkQqoZhJShFbWvxOOQmZL90cOU-IjEKO0iAwHkw-OojfG_Mu6ZAIDz04M9Z8tIv7_d9Z_IJyUuijAwlDc5wmltGEa0DM4iGj_VipZiqsJQcsokDZfxfMkZbF5LifzOFLufKOrE8ydnnyw"
              />
              <div className="w-7 h-7 rounded-full border border-white bg-orange-100 flex items-center justify-center text-[9px] font-black text-[#a14000]">
                +{goingCount - 2}
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-500">{goingCount} customers are going</p>
          </div>
        </div>

      </div>

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-[#261812] text-white p-3.5 rounded-xl shadow-lg border border-[#e2bfb0]/25 flex gap-2 items-center text-xs"
          >
            <Info className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
